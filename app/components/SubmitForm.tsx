
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { blinkSubmissionSchema } from '@/lib/validation';
import { useState } from 'react';
import { CATEGORIES } from '@/lib/types';
import { z } from 'zod';

type FormData = z.infer<typeof blinkSubmissionSchema>;

export default function SubmitForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [createdBlink, setCreatedBlink] = useState<any>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<FormData>({
        resolver: zodResolver(blinkSubmissionSchema),
        defaultValues: {
            category: 'utilities',
        }
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        setSubmitStatus('idle');
        setErrorMessage('');

        try {
            const response = await fetch('/api/blinks/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit blink');
            }

            setSubmitStatus('success');
            setCreatedBlink(result.blink);
            reset(); // Clear form
        } catch (error: any) {
            setSubmitStatus('error');
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitStatus === 'success') {
        return (
            <div className="card p-8 text-center max-w-xl mx-auto border-green-500/30 bg-green-500/5">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                    ✅
                </div>
                <h2 className="text-2xl font-bold mb-4">Submission Received!</h2>
                <p className="text-gray-300 mb-6">
                    Your Blink <strong>{createdBlink?.name}</strong> has been submitted successfully.
                    Our team handles manual reviews to ensure safety, so it will appear in the directory within 24 hours.
                </p>
                <button
                    onClick={() => setSubmitStatus('idle')}
                    className="btn-primary"
                >
                    Submit Another
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="card p-8 max-w-2xl mx-auto space-y-6">

            {/* URL Input */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                    Blink / Action URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        {...register('url')}
                        type="url"
                        placeholder="https://jup.ag/swap/SOL-USDC"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        We will automatically fetch the icon and title to verify it works.
                    </p>
                </div>
                {errors.url && <p className="text-red-400 text-sm">{errors.url.message}</p>}
            </div>

            {/* Basic Info Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('name')}
                        type="text"
                        placeholder="Jupiter Swap"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    />
                    {errors.name && <p className="text-red-400 text-sm">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('category')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all appearance-none"
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat.slug} value={cat.slug} className="bg-[#1a1a25]">
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    {errors.category && <p className="text-red-400 text-sm">{errors.category.message}</p>}
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                    Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    {...register('description')}
                    rows={4}
                    placeholder="Briefly describe what this Blink allows users to do..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                />
                {errors.description && <p className="text-red-400 text-sm">{errors.description.message}</p>}
            </div>

            {/* Creator Info (Optional) */}
            <div className="pt-4 border-t border-white/5">
                <h3 className="text-lg font-semibold mb-4 text-gray-300">Creator Info (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Twitter Handle</label>
                        <input
                            {...register('creator_twitter')}
                            type="text"
                            placeholder="@username"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Email (Private)</label>
                        <input
                            {...register('creator_email')}
                            type="email"
                            placeholder="For approval notifications"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {submitStatus === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm">
                    🚨 {errorMessage}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary h-12 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <span className="flex items-center gap-2">
                        <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
                        Validating...
                    </span>
                ) : (
                    'Submit Blink'
                )}
            </button>

        </form>
    );
}
