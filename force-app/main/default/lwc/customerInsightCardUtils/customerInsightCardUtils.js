/**
 * Utility functions for Customer Insight Card LWC.
 * Formatting and sentiment mapping for display.
 * This module is a valid LWC bundle for import; the default export is not used in templates.
 */

import { LightningElement } from 'lwc';

/**
 * Placeholder component so this folder is a valid LWC module. Not used in any template.
 */
export default class CustomerInsightCardUtils extends LightningElement {}

/**
 * Formats a numeric value as USD currency (e.g. $15,000).
 * @param {number|string|null|undefined} value - Raw value from record (number or string).
 * @returns {string} Formatted currency string, or '$0' if value is null/undefined/non-numeric.
 */
export function formatCurrency(value) {
    if (value === null || value === undefined || value === '') {
        return '$0';
    }
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (Number.isNaN(num)) {
        return '$0';
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
}

/**
 * Formats a numeric value as percentage (e.g. 86%).
 * @param {number|string|null|undefined} value - Raw value 0-100.
 * @returns {string} Formatted percentage string, or '0%' if value is null/undefined/non-numeric.
 */
export function formatPercent(value) {
    if (value === null || value === undefined || value === '') {
        return '0%';
    }
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (Number.isNaN(num)) {
        return '0%';
    }
    const rounded = Math.round(num);
    return `${rounded}%`;
}

/**
 * Normalizes sentiment string to a level used for badge styling.
 * @param {string|null|undefined} sentiment - Raw sentiment (e.g. "Positive", "High", "Negative", "Low").
 * @returns {'positive'|'neutral'|'negative'} Level for CSS class and color mapping.
 */
export function getSentimentLevel(sentiment) {
    if (sentiment === null || sentiment === undefined || sentiment === '') {
        return 'neutral';
    }
    const s = String(sentiment).toLowerCase().trim();
    if (s === 'positive' || s === 'high' || s === 'good' || s === 'up') {
        return 'positive';
    }
    if (s === 'negative' || s === 'low' || s === 'bad' || s === 'down') {
        return 'negative';
    }
    return 'neutral';
}