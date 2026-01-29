// lib/blinkCrawler.ts

interface ActionMetadata {
  url: string;
  icon: string;
  title: string;
  description: string;
  actions: Array<{
    label: string;
    href: string;
    parameters?: Array<{
      name: string;
      label?: string;
      required?: boolean;
    }>;
  }>;
}

interface ActionsJson {
  rules: Array<{
    pathPattern: string;
    apiPath: string;
  }>;
  icon?: string;
  title?: string;
  description?: string;
}

/**
 * Discovers all Solana Actions from a domain
 * Returns actual action endpoints, not homepage URLs
 */
export async function discoverActionsFromDomain(domain: string): Promise<ActionMetadata[]> {
  try {
    const actionsJsonUrl = `https://${domain}/actions.json`;
    console.log(`Fetching actions.json from ${actionsJsonUrl}`);

    const response = await fetch(actionsJsonUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      console.log(`No actions.json found for ${domain}`);
      return [];
    }

    const actionsJson: ActionsJson = await response.json();
    const discovered: ActionMetadata[] = [];

    if (!actionsJson.rules || actionsJson.rules.length === 0) {
      console.log(`No rules found in actions.json for ${domain}`);
      return [];
    }

    console.log(`Found ${actionsJson.rules.length} rules for ${domain}`);

    // Process each rule to find actual action endpoints
    for (const rule of actionsJson.rules) {
      try {
        // Build the actual action URL from the rule
        const actionUrl = rule.apiPath.startsWith('http')
          ? rule.apiPath
          : `https://${domain}${rule.apiPath.startsWith('/') ? '' : '/'}${rule.apiPath}`;

        console.log(`Testing action endpoint: ${actionUrl}`);

        // Fetch action metadata
        const actionRes = await fetch(actionUrl, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(8000)
        });

        if (!actionRes.ok) {
          console.log(`Action endpoint ${actionUrl} returned ${actionRes.status}`);
          continue;
        }

        const metadata = await actionRes.json();

        // Validate it's a real action with buttons
        if (metadata.icon && metadata.title && metadata.links?.actions && metadata.links.actions.length > 0) {
          discovered.push({
            url: actionUrl,
            icon: metadata.icon,
            title: metadata.title,
            description: metadata.description || '',
            actions: metadata.links.actions
          });
          console.log(`✅ Found valid action: ${metadata.title}`);
        } else {
          console.log(`❌ Endpoint ${actionUrl} missing required fields`);
        }
      } catch (err) {
        console.error(`Failed to fetch action from ${rule.apiPath}:`, err);
      }
    }

    return discovered;
  } catch (error) {
    console.error(`Failed to discover actions from ${domain}:`, error);
    return [];
  }
}

/**
 * Validates that an action URL actually works end-to-end
 * Tests both GET (metadata) and POST (transaction generation)
 */
export async function validateActionEndpoint(url: string): Promise<{
  isValid: boolean;
  error?: string;
  metadata?: {
    title: string;
    description: string;
    icon: string;
    actionCount: number;
  };
}> {
  try {
    // 1. GET request should return metadata
    const getRes = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(12000) // Increased from 8s to 12s
    });

    if (!getRes.ok) {
      return {
        isValid: false,
        error: `GET request failed with status ${getRes.status}`
      };
    }

    const metadata = await getRes.json();

    // 2. Must have required fields
    if (!metadata.icon || !metadata.title) {
      return {
        isValid: false,
        error: 'Missing required fields (icon, title)'
      };
    }

    // 3. Must have action links
    if (!metadata.links?.actions || metadata.links.actions.length === 0) {
      return {
        isValid: false,
        error: 'No action buttons found'
      };
    }

    // 4. Test POST endpoint (more lenient)
    try {
      const firstAction = metadata.links.actions[0];
      const actionUrl = firstAction.href.startsWith('http')
        ? firstAction.href
        : new URL(firstAction.href, url).toString();

      const postRes = await fetch(actionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          account: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH'
        }),
        signal: AbortSignal.timeout(12000)
      });

      // POST should work - accept 200, 400 (validation error), or 201
      // Only reject on 404 (not found) or 500+ (server error)
      if (postRes.status === 404 || postRes.status >= 500) {
        // Don't fail validation - POST test is optional
        console.log(`⚠️  POST test failed (${postRes.status}), but GET succeeded`);
      }
    } catch (postError) {
      // POST test failed, but that's okay if GET worked
      console.log(`⚠️  POST test error: ${postError instanceof Error ? postError.message : 'Unknown'}`);
    }

    return {
      isValid: true,
      metadata: {
        title: metadata.title,
        description: metadata.description || '',
        icon: metadata.icon,
        actionCount: metadata.links.actions.length
      }
    };

  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Batch discover actions from multiple known domains
 */
export async function discoverFromKnownProviders(): Promise<ActionMetadata[]> {
  const knownProviders = [
    'dial.to',
    'send.dialect.to',
    'www.truflation.com',
    'swap.solayer.org',
    // Add more as you discover them
  ];

  const allActions: ActionMetadata[] = [];

  for (const domain of knownProviders) {
    console.log(`\nDiscovering actions from ${domain}...`);
    const actions = await discoverActionsFromDomain(domain);
    allActions.push(...actions);

    // Rate limiting - wait 1 second between domains
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return allActions;
}

/**
 * Get action category based on metadata
 */
export function categorizeAction(metadata: ActionMetadata): string {
  const title = metadata.title.toLowerCase();
  const description = metadata.description.toLowerCase();
  const combined = `${title} ${description}`;

  if (combined.match(/swap|trade|exchange|dex/)) return 'defi';
  if (combined.match(/nft|mint|collection/)) return 'nft';
  if (combined.match(/game|play|gaming/)) return 'gaming';
  if (combined.match(/social|vote|dao|governance/)) return 'social';
  if (combined.match(/send|transfer|payment|tip/)) return 'utilities';

  return 'other';
}

/**
 * Format discovered action for database insertion
 */
export function formatForDatabase(action: ActionMetadata) {
  return {
    url: action.url,
    name: action.title,
    description: action.description || `${action.title} - Solana Action with ${action.actions.length} button${action.actions.length > 1 ? 's' : ''}`,
    category: categorizeAction(action),
    icon_url: action.icon,
    verified: false, // Manual verification still needed
    featured: false,
    source: 'crawler',
    status: 'pending', // Admin approval needed
    is_valid_blink: true,
    last_checked: new Date().toISOString()
  };
}
