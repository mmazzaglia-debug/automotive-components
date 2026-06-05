/**
 * Customer Insight Card – Lightning Web Component
 * Displays a customer summary with photo, location, action buttons, contact info, and Engagement Signals.
 * Fetches record data via getRecord; all fields and colors are configurable in Lightning App Builder.
 * On Case (or other parent) pages: set "Related lookup field" (e.g. Case.ContactId) to pull customer from the related record.
 * LTV, CSAT, and Sentiment can be edited inline to override or fake values.
 *
 * TEST DATA USAGE:
 * - Contact/Account page: set field API names to match (Contact.Name, Contact.Email, etc.).
 * - Case page: set "Related lookup field" to Case.ContactId or Case.AccountId, and set field API names to the
 *   related object (e.g. Contact.Name, Contact.Email). Customer data is loaded from the related Contact/Account.
 * - Engagement values (LTV, CSAT, Sentiment) are editable: click the pencil to override or type a fake number.
 */

import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue, getFieldDisplayValue } from 'lightning/uiRecordApi';
import { formatCurrency, formatPercent, getSentimentLevel } from 'c/customerInsightCardUtils';

/** Placeholder image when no photo field is configured or value is missing (CSP-safe data URI). */
const PLACEHOLDER_PHOTO = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Ccircle cx="32" cy="24" r="14" fill="%23999"/%3E%3Cellipse cx="32" cy="58" rx="20" ry="18" fill="%23999"/%3E%3C/svg%3E';

/**
 * Builds the list of field API names to request from getRecord (only non-empty configured fields).
 * @param {CustomerInsightCard} component - This component instance.
 * @returns {string[]} Array of field API names (e.g. ['Contact.Name', 'Contact.Email']).
 */
function getFieldsToRequest(component) {
    const fields = [
        component.nameField,
        component.titleField,
        component.locationField,
        component.emailField,
        component.phoneField,
        component.addressField,
        component.accountIdField,
        component.accountNameField,
        component.photoField,
        component.csatField,
        component.ltvField,
        component.sentimentField
    ].filter(Boolean);
    const unique = [...new Set(fields)];
    // getRecord requires at least one field; fallback to name if nothing configured
    if (unique.length === 0 && component.nameField) {
        return [component.nameField];
    }
    return unique;
}

/** Salesforce key prefix for Case (parent object that needs related lookup for customer data). */
const CASE_KEY_PREFIX = '500';

/** Map record Id key prefix (3 chars) to object API name for standard objects. */
const KEY_PREFIX_TO_OBJECT = {
    '500': 'Case',
    '003': 'Contact',
    '001': 'Account',
    '00Q': 'Lead'
};

/**
 * Returns true if the given record Id is a Case (so we must use Related Lookup Field for customer data).
 * @param {string} recordId - 15 or 18 char Salesforce Id.
 * @returns {boolean}
 */
function isCaseRecordId(recordId) {
    return typeof recordId === 'string' && recordId.length >= 3 && recordId.substring(0, 3) === CASE_KEY_PREFIX;
}

/**
 * Returns the object API name for a record Id based on key prefix, or null if unknown (e.g. custom object).
 * @param {string} recordId - 15 or 18 char Salesforce Id.
 * @returns {string|null}
 */
function getObjectApiNameFromRecordId(recordId) {
    if (!recordId || typeof recordId !== 'string' || recordId.length < 3) return null;
    return KEY_PREFIX_TO_OBJECT[recordId.substring(0, 3)] || null;
}

/**
 * When loading a Contact, rewrites Account.X to Contact.Account.X so we request/read the Account field via the Contact.
 * @param {string} fieldApiName - Single field (e.g. Account.SDO_Sales_Closed_Won_Value__c).
 * @param {string} recordId - The record we're loading.
 * @returns {string} Field to use (e.g. Contact.Account.SDO_Sales_Closed_Won_Value__c).
 */
function getFieldApiNameForRecord(fieldApiName, recordId) {
    if (!fieldApiName || typeof fieldApiName !== 'string') return fieldApiName;
    const obj = getObjectApiNameFromRecordId(recordId);
    if (obj === 'Contact' && fieldApiName.startsWith('Account.') && !fieldApiName.startsWith('Contact.')) {
        return 'Contact.' + fieldApiName;
    }
    return fieldApiName;
}

/**
 * When loading a Contact, rewrites Account.X to Contact.Account.X so we request/read the Account field via the Contact.
 * So e.g. Account.SDO_Sales_Closed_Won_Value__c becomes Contact.Account.SDO_Sales_Closed_Won_Value__c.
 * @param {string[]} fields - Field API names from config.
 * @param {string} recordId - The record we're loading.
 * @returns {string[]}
 */
function mapCrossObjectFieldsForRecord(fields, recordId) {
    const obj = getObjectApiNameFromRecordId(recordId);
    if (obj !== 'Contact') return fields;
    return fields.map((f) => {
        if (typeof f !== 'string' || !f) return f;
        if (f.startsWith('Account.') && !f.startsWith('Contact.')) return 'Contact.' + f;
        return f;
    });
}

/**
 * Filters field API names to only those that belong to the record being loaded (same object).
 * Prevents "object api names do not correspond" error when e.g. Case.ContactId is in config but we load a Contact.
 * @param {string[]} fields - Full field API names (e.g. ['Contact.Name', 'Case.ContactId']).
 * @param {string} recordId - The record Id we're loading (determines object type).
 * @returns {string[]}
 */
function filterFieldsForRecord(fields, recordId) {
    const objectApiName = getObjectApiNameFromRecordId(recordId);
    if (!objectApiName) {
        return fields.filter((f) => typeof f === 'string' && !f.startsWith('Case.'));
    }
    const prefix = objectApiName + '.';
    return fields.filter((f) => typeof f === 'string' && f.startsWith(prefix));
}

/** Standard fields we always request for Contact so name/email/phone/address load even if page config is wrong. */
const CONTACT_FALLBACK_FIELDS = ['Contact.Name', 'Contact.Email', 'Contact.Phone', 'Contact.Title', 'Contact.MailingStreet', 'Contact.MailingCity', 'Contact.AccountId', 'Contact.Account.Name'];

/** Standard fields we always request for Account. */
const ACCOUNT_FALLBACK_FIELDS = ['Account.Name', 'Account.Phone', 'Account.BillingStreet', 'Account.BillingCity'];

/**
 * Ensures we request at least the standard fields for the record's object so core info always loads.
 * @param {string[]} filtered - Fields already filtered for the record's object.
 * @param {string} recordId - The record Id we're loading.
 * @returns {string[]}
 */
function ensureMinimumFieldsForRecord(filtered, recordId) {
    const objectApiName = getObjectApiNameFromRecordId(recordId);
    if (!objectApiName) return filtered;
    const fallback = objectApiName === 'Contact' ? CONTACT_FALLBACK_FIELDS : (objectApiName === 'Account' ? ACCOUNT_FALLBACK_FIELDS : null);
    if (!fallback) return filtered;
    const set = new Set(filtered);
    fallback.forEach((f) => set.add(f));
    return [...set];
}

/**
 * Safely gets a field value from the record, with fallback for missing/undefined.
 * @param {object} record - Raw record from getRecord (data).
 * @param {string} fieldApiName - Full field API name (e.g. Contact.Email).
 * @returns {string|number|null} Value or null.
 */
function safeGetFieldValue(record, fieldApiName) {
    if (!record || !fieldApiName) return null;
    try {
        const val = getFieldValue(record, fieldApiName) ?? getFieldDisplayValue(record, fieldApiName);
        return val !== undefined && val !== null ? val : null;
    } catch {
        return null;
    }
}

/**
 * Builds "Title at Account Name" display string (e.g. "CEO at Omega").
 * @param {string|null|undefined} title - Contact title.
 * @param {string|null|undefined} accountName - Account name.
 * @returns {string}
 */
function buildTitleAtAccountDisplay(title, accountName) {
    const t = title != null && String(title).trim() !== '' ? String(title).trim() : null;
    const a = accountName != null && String(accountName).trim() !== '' && String(accountName).trim() !== '—' ? String(accountName).trim() : null;
    if (t && a) return `${t} at ${a}`;
    if (t) return t;
    if (a) return `at ${a}`;
    return '—';
}

export default class CustomerInsightCard extends NavigationMixin(LightningElement) {
    /** Record Id provided by the record page or App Builder. */
    @api recordId;

    /** Card title (configurable in App Builder). */
    @api cardTitle = 'Customer Summary';

    /** Show/hide Call button. Default true from App Builder. */
    @api showCallButton = false;
    /** Show/hide Message button. Deprecated: button removed; kept for page compatibility. */
    @api showMessageButton = false;
    /** Show/hide Email button. Default true from App Builder. */
    @api showEmailButton = false;

    /** Field API name for name (e.g. Contact.Name). */
    @api nameField = 'Contact.Name';
    /** Field API name for title (e.g. Contact.Title). Shown as "Title at Account Name" below the name. */
    @api titleField = 'Contact.Title';
    /** Field API name for location. */
    @api locationField = '';
    /** Field API name for email. */
    @api emailField = 'Contact.Email';
    /** Field API name for phone. */
    @api phoneField = 'Contact.Phone';
    /** Field API name for address. */
    @api addressField = '';
    /** Field API name for Account lookup Id (e.g. Contact.AccountId). Used for Account link. */
    @api accountIdField = 'Contact.AccountId';
    /** Field API name for Account name (e.g. Contact.Account.Name). Displayed in Account row. */
    @api accountNameField = 'Contact.Account.Name';
    /** Field API name for photo URL. */
    @api photoField = '';
    /** Field API name for CSAT (0-100). */
    @api csatField = '';
    /** Field API name for LTV (currency). */
    @api ltvField = '';
    /** Field API name for sentiment. */
    @api sentimentField = '';

    /** Header gradient start color. */
    @api headerBackgroundColor = '#1b3a5c';
    /** Header gradient end color. */
    @api headerGradientColor = '#2d5a87';
    /** Badge color for positive. */
    @api badgePositiveColor = '#4caf50';
    /** Badge color for neutral. */
    @api badgeNeutralColor = '#9e9e9e';
    /** Badge color for negative. */
    @api badgeNegativeColor = '#f44336';

    /**
     * When on a parent record (e.g. Case), the lookup field whose value is the customer record Id (e.g. Case.ContactId, Case.AccountId).
     * Leave blank to use the page record as the customer. When set, customer data is loaded from the related record.
     */
    @api relatedLookupField = '';

    /** When true, LTV / CSAT / Sentiment can be edited inline to override or fake values. Default true from App Builder. */
    @api allowEditEngagement = false;

    /** When true, show troubleshooting panel with record Ids, requested fields, and values read. Use in Edit Page or on record to debug. */
    @api showDebugInfo = false;

    /** Cached record data from wire; set in wire handler. */
    _record = null;
    /** Wire error if getRecord failed. */
    _wireError = null;
    /** When using relatedLookupField, the resolved customer record Id (Contact/Account). */
    _resolvedCustomerId = null;
    /** Id of the record we are displaying (used for name-click navigation). */
    _customerRecordId = null;
    /** Local overrides for engagement (session-only; overrides record values when set). */
    _ltvOverride = null;
    _csatOverride = null;
    _sentimentOverride = null;
    /** Which engagement field is in edit mode: 'ltv' | 'csat' | 'sentiment' | null */
    _editingSignal = null;
    /** Draft values while editing (for reactive input display). */
    _ltvDraft = '';
    _csatDraft = '';
    _sentimentDraft = '';

    /**
     * Wire: when on a parent record (e.g. Case), load the related lookup field to get the customer record Id.
     * Only runs when relatedLookupField is set (parentRecordIdForLookup and parentLookupFields are defined).
     */
    @wire(getRecord, {
        recordId: '$parentRecordIdForLookup',
        fields: '$parentLookupFields'
    })
    wiredParentRecord({ data, error }) {
        if (!this.relatedLookupField) {
            this._resolvedCustomerId = null;
            return;
        }
        if (error) {
            this._wireError = error;
            this._resolvedCustomerId = null;
            return;
        }
        if (!data) {
            this._resolvedCustomerId = null;
            return;
        }
        const raw = safeGetFieldValue(data, this.relatedLookupField);
        const relatedId = typeof raw === 'string' ? raw : (raw && typeof raw.id === 'string' ? raw.id : null);
        this._resolvedCustomerId = relatedId || null;
    }

    /**
     * Record Id for the parent lookup wire. Undefined when not using related lookup so the wire does not run.
     * @returns {string|undefined}
     */
    get parentRecordIdForLookup() {
        return this.relatedLookupField && this.recordId ? this.recordId : undefined;
    }

    /**
     * Fields to load from the page record when resolving related lookup (e.g. [Case.ContactId]).
     * @returns {string[]}
     */
    get parentLookupFields() {
        if (!this.recordId || !this.relatedLookupField) return [];
        return [this.relatedLookupField];
    }

    /**
     * The record Id to use for loading customer data: either the page record or the resolved related record.
     * When on a Case page without Related Lookup Field we return undefined so we don't request Contact fields for a Case (avoids API error).
     * @returns {string|null|undefined}
     */
    get effectiveRecordId() {
        if (this.relatedLookupField) {
            return this._resolvedCustomerId || undefined;
        }
        if (this.recordId && isCaseRecordId(this.recordId)) {
            return undefined;
        }
        return this.recordId || null;
    }

    /**
     * Wire adapter: load customer record fields. Uses effectiveRecordId (page record or resolved Contact/Account).
     * optionalFields: missing or inaccessible fields won't fail the load.
     */
    @wire(getRecord, {
        recordId: '$effectiveRecordId',
        fields: '$wiredFields',
        optionalFields: '$wiredOptionalFields'
    })
    wiredRecord({ data, error }) {
        if (this.relatedLookupField && !this._resolvedCustomerId) {
            this._record = null;
            this._wireError = null;
            this._customerRecordId = null;
            return;
        }
        this._wireError = error || null;
        this._record = data || null;
        this._customerRecordId = data && typeof data.id === 'string' ? data.id : (data ? this.effectiveRecordId : null);
    }

    /**
     * Reactive wire parameter: list of field API names for getRecord (customer object).
     * Filtered to only fields of the record's object (e.g. only Contact.* when loading a Contact) to avoid API error.
     * @returns {string[]}
     */
    get wiredFields() {
        const eid = this.effectiveRecordId;
        if (!eid) return [];
        let all = getFieldsToRequest(this);
        all = mapCrossObjectFieldsForRecord(all, eid);
        let filtered = filterFieldsForRecord(all, eid);
        filtered = ensureMinimumFieldsForRecord(filtered, eid);
        return filtered.length > 0 ? filtered : (this.nameField ? filterFieldsForRecord([this.nameField], eid) : []);
    }

    /**
     * Optional fields for getRecord: all except name field. Missing/inaccessible optional fields won't fail the load.
     * @returns {string[]}
     */
    get wiredOptionalFields() {
        const eid = this.effectiveRecordId;
        if (!eid) return [];
        let all = getFieldsToRequest(this);
        all = mapCrossObjectFieldsForRecord(all, eid);
        all = filterFieldsForRecord(all, eid);
        all = ensureMinimumFieldsForRecord(all, eid);
        const required = this.nameField && all.includes(this.nameField) ? [this.nameField] : (all.length ? [all[0]] : []);
        return all.filter((f) => !required.includes(f));
    }

    /**
     * Whether the wire returned an error.
     * @returns {boolean}
     */
    get hasError() {
        return !!this._wireError;
    }

    /**
     * User-friendly error message from the wire (body.message or body.pageErrors).
     * @returns {string}
     */
    get wireErrorMessage() {
        const err = this._wireError;
        if (!err) return '';
        const body = err.body;
        if (!body) return err.message || String(err);
        if (typeof body.message === 'string') return body.message;
        if (Array.isArray(body.pageErrors) && body.pageErrors.length > 0) {
            const first = body.pageErrors[0];
            return typeof first === 'string' ? first : (first.message || String(first));
        }
        return err.message || String(err);
    }

    /**
     * Whether we have a valid record and should show the card (no error, have effective record and data).
     * @returns {boolean}
     */
    get hasRecord() {
        if (this._wireError) return false;
        if (this.relatedLookupField) return !!this._resolvedCustomerId && !!this._record;
        return !!this.recordId && !!this._record;
    }

    /**
     * Whether to show the "no record" state (no context or no data, and no wire error).
     * @returns {boolean}
     */
    get showNoRecord() {
        if (this._wireError) return false;
        if (!this.recordId) return true;
        if (this.relatedLookupField) return !this._resolvedCustomerId || !this._record;
        if (isCaseRecordId(this.recordId)) return true;
        return !this._record;
    }

    /**
     * Whether to show the "set Related Lookup Field" hint (Case page or related lookup configured).
     * @returns {boolean}
     */
    get showRelatedLookupHint() {
        return !!(this.relatedLookupField || (this.recordId && isCaseRecordId(this.recordId)));
    }

    /**
     * Troubleshooting: which record we load, which fields we request, and what we read.
     * Enable "Show debug info" in the component to see this panel.
     * @returns {object}
     */
    get debugInfo() {
        const eid = this.effectiveRecordId;
        const obj = eid ? getObjectApiNameFromRecordId(eid) : null;
        const requested = eid ? this.wiredFields : [];
        const rd = this._record ? this.recordData : null;
        return {
            pageRecordId: this.recordId || '(none)',
            relatedLookupField: this.relatedLookupField || '(not set)',
            resolvedCustomerId: this._resolvedCustomerId || '(null)',
            effectiveRecordId: eid || '(none – not loading)',
            recordObject: obj || '(unknown)',
            requestedFields: requested,
            requestedFieldsStr: requested.length ? requested.join(', ') : '(none)',
            fieldChecks: rd ? [
                { label: 'Name', field: this.nameField, value: rd.name },
                { label: 'Email', field: this.emailField, value: rd.email },
                { label: 'Phone', field: this.phoneField, value: rd.phone },
                { label: 'Address', field: this.addressField, value: rd.address },
                { label: 'Account', field: this.accountNameField, value: rd.accountName },
                { label: 'LTV', field: this.ltvField ? getFieldApiNameForRecord(this.ltvField, eid) : '(not set)', value: rd.ltvFormatted }
            ] : []
        };
    }

    /**
     * Normalized record data for the template: name, location, email, phone, address, photoUrl, csat, ltv, sentiment.
     * All values have fallbacks (e.g. '—', 'N/A', placeholder photo).
     * @returns {object}
     */
    get recordData() {
        const r = this._record;
        if (!r) {
            return {
                name: '—',
                titleAtAccountDisplay: '—',
                location: '—',
                email: '—',
                phone: '—',
                address: '—',
                accountName: '—',
                accountId: null,
                photoUrl: PLACEHOLDER_PHOTO,
                csat: null,
                ltv: null,
                sentiment: null,
                csatFormatted: 'N/A',
                ltvFormatted: '$0',
                sentimentDisplay: 'N/A',
                sentimentLevel: 'neutral'
            };
        }
        const recordId = this._customerRecordId || this.effectiveRecordId;
        const obj = getObjectApiNameFromRecordId(recordId);
        const name = safeGetFieldValue(r, this.nameField) ?? (obj === 'Contact' ? safeGetFieldValue(r, 'Contact.Name') : null) ?? (obj === 'Account' ? safeGetFieldValue(r, 'Account.Name') : null) ?? '—';
        const title = safeGetFieldValue(r, this.titleField) ?? (obj === 'Contact' ? safeGetFieldValue(r, 'Contact.Title') : null);
        const accountNameForTitle = safeGetFieldValue(r, this.accountNameField);
        const titleAtAccountDisplay = buildTitleAtAccountDisplay(title, accountNameForTitle);
        const location = safeGetFieldValue(r, this.locationField) ?? (obj === 'Contact' ? safeGetFieldValue(r, 'Contact.MailingCity') : null) ?? (obj === 'Account' ? safeGetFieldValue(r, 'Account.BillingCity') : null) ?? '—';
        const email = safeGetFieldValue(r, this.emailField) ?? (obj === 'Contact' ? safeGetFieldValue(r, 'Contact.Email') : null) ?? '—';
        const phone = safeGetFieldValue(r, this.phoneField) ?? (obj === 'Contact' ? safeGetFieldValue(r, 'Contact.Phone') : null) ?? (obj === 'Account' ? safeGetFieldValue(r, 'Account.Phone') : null) ?? '—';
        const address = safeGetFieldValue(r, this.addressField) ?? (obj === 'Contact' ? safeGetFieldValue(r, 'Contact.MailingStreet') : null) ?? (obj === 'Account' ? safeGetFieldValue(r, 'Account.BillingStreet') : null) ?? '—';
        const accountIdRaw = safeGetFieldValue(r, this.accountIdField);
        const accountId = accountIdRaw && typeof accountIdRaw === 'string' ? accountIdRaw : (accountIdRaw && accountIdRaw.id ? accountIdRaw.id : null);
        const accountName = safeGetFieldValue(r, this.accountNameField) ?? '—';
        let photoUrl = safeGetFieldValue(r, this.photoField);
        if (!photoUrl || typeof photoUrl !== 'string') photoUrl = PLACEHOLDER_PHOTO;
        const csatRaw = safeGetFieldValue(r, this.csatField);
        const ltvFieldForRecord = getFieldApiNameForRecord(this.ltvField, this.effectiveRecordId);
        const ltvRaw = safeGetFieldValue(r, ltvFieldForRecord);
        const sentimentRaw = safeGetFieldValue(r, this.sentimentField);
        const csat = this._csatOverride !== null && this._csatOverride !== undefined ? this._csatOverride : csatRaw;
        const ltv = this._ltvOverride !== null && this._ltvOverride !== undefined ? this._ltvOverride : ltvRaw;
        const sentiment = this._sentimentOverride !== null && this._sentimentOverride !== undefined ? this._sentimentOverride : sentimentRaw;
        const sentimentLevel = getSentimentLevel(sentiment);
        return {
            name: String(name),
            titleAtAccountDisplay,
            location: String(location),
            email: String(email),
            phone: String(phone),
            address: String(address),
            accountName: String(accountName),
            accountId: accountId || null,
            photoUrl: String(photoUrl),
            csat,
            ltv,
            sentiment,
            csatFormatted: formatPercent(csat),
            ltvFormatted: formatCurrency(ltv),
            sentimentDisplay: sentiment != null && sentiment !== '' ? String(sentiment) : 'N/A',
            sentimentLevel
        };
    }

    /** Whether Account row should be shown (accountIdField or accountNameField configured). */
    get hasAccountField() {
        return !!(this.accountIdField || this.accountNameField);
    }

    /** Whether CSAT is currently in edit mode. */
    get editingCsat() { return this._editingSignal === 'csat'; }
    /** Whether LTV is currently in edit mode. */
    get editingLtv() { return this._editingSignal === 'ltv'; }
    /** Whether Sentiment is currently in edit mode. */
    get editingSentiment() { return this._editingSignal === 'sentiment'; }

    /** Raw LTV value for the input (string). When editing, shows draft. */
    get ltvInputValue() {
        if (this._editingSignal === 'ltv') return this._ltvDraft;
        if (this._ltvOverride !== null && this._ltvOverride !== undefined) return String(this._ltvOverride);
        const d = this.recordData;
        return d?.ltv != null && d?.ltv !== '' ? String(d.ltv) : '';
    }
    /** Raw CSAT value for the input (string). When editing, shows draft. */
    get csatInputValue() {
        if (this._editingSignal === 'csat') return this._csatDraft;
        if (this._csatOverride !== null && this._csatOverride !== undefined) return String(this._csatOverride);
        const d = this.recordData;
        return d?.csat != null && d?.csat !== '' ? String(d.csat) : '';
    }
    /** Raw Sentiment value for the input (string). When editing, shows draft. */
    get sentimentInputValue() {
        if (this._editingSignal === 'sentiment') return this._sentimentDraft;
        if (this._sentimentOverride !== null && this._sentimentOverride !== undefined) return String(this._sentimentOverride);
        const d = this.recordData;
        return d?.sentimentDisplay && d.sentimentDisplay !== 'N/A' ? d.sentimentDisplay : '';
    }

    /**
     * Toggles edit mode for a signal; initializes draft from current value.
     * @param {string} signal - 'csat' | 'ltv' | 'sentiment'
     */
    toggleEdit(signal) {
        if (this._editingSignal === signal) {
            this._editingSignal = null;
            return;
        }
        this._editingSignal = signal;
        const d = this.recordData;
        if (signal === 'ltv') this._ltvDraft = this._ltvOverride != null ? String(this._ltvOverride) : (d?.ltv != null ? String(d.ltv) : '');
        if (signal === 'csat') this._csatDraft = this._csatOverride != null ? String(this._csatOverride) : (d?.csat != null ? String(d.csat) : '');
        if (signal === 'sentiment') this._sentimentDraft = this._sentimentOverride != null ? String(this._sentimentOverride) : (d?.sentimentDisplay !== 'N/A' ? d?.sentimentDisplay : '');
    }

    handleToggleEditLtv() { this.toggleEdit('ltv'); }
    handleToggleEditCsat() { this.toggleEdit('csat'); }
    handleToggleEditSentiment() { this.toggleEdit('sentiment'); }

    handleLtvInput(evt) { this._ltvDraft = evt.target.value; }
    handleCsatInput(evt) { this._csatDraft = evt.target.value; }
    handleSentimentInput(evt) { this._sentimentDraft = evt.target.value; }

    handleLtvKeydown(evt) { if (evt.key === 'Enter') evt.target.blur(); }
    handleCsatKeydown(evt) { if (evt.key === 'Enter') evt.target.blur(); }
    handleSentimentKeydown(evt) { if (evt.key === 'Enter') evt.target.blur(); }

    /**
     * Handles blur/commit of the LTV input; applies override from draft.
     * @param {Event} evt
     */
    handleLtvChange(evt) {
        const raw = evt.target.value;
        const trimmed = raw ? String(raw).trim() : '';
        if (trimmed === '') {
            this._ltvOverride = null;
        } else {
            const num = parseFloat(trimmed.replace(/[$,]/g, ''));
            this._ltvOverride = Number.isNaN(num) ? trimmed : num;
        }
        this._ltvDraft = '';
        this._editingSignal = null;
    }

    /**
     * Handles blur/commit of the CSAT input; applies override from draft.
     * @param {Event} evt
     */
    handleCsatChange(evt) {
        const raw = evt.target.value;
        const trimmed = raw ? String(raw).trim() : '';
        if (trimmed === '') {
            this._csatOverride = null;
        } else {
            const num = parseFloat(trimmed.replace(/%/g, ''));
            this._csatOverride = Number.isNaN(num) ? trimmed : num;
        }
        this._csatDraft = '';
        this._editingSignal = null;
    }

    /**
     * Handles blur/commit of the Sentiment input; applies override from draft.
     * @param {Event} evt
     */
    handleSentimentChange(evt) {
        const raw = evt.target.value;
        this._sentimentOverride = raw ? String(raw).trim() : null;
        this._sentimentDraft = '';
        this._editingSignal = null;
    }

    /**
     * CSS class for the sentiment badge (positive / neutral / negative).
     * @returns {string}
     */
    get sentimentBadgeClass() {
        const level = this.recordData?.sentimentLevel || 'neutral';
        return `badge badge-${level}`;
    }

    /**
     * CSS custom properties for the root (header gradient and badge colors from App Builder).
     * @returns {string}
     */
    get rootStyle() {
        const h = this.headerBackgroundColor || '#1b3a5c';
        const g = this.headerGradientColor || '#2d5a87';
        const p = this.badgePositiveColor || '#4caf50';
        const n = this.badgeNeutralColor || '#9e9e9e';
        const neg = this.badgeNegativeColor || '#f44336';
        return [
            `--header-bg:${h}`,
            `--header-gradient:${g}`,
            `--badge-positive:${p}`,
            `--badge-neutral:${n}`,
            `--badge-negative:${neg}`
        ].join('; ');
    }

    /**
     * Opens the default phone app or dialer with the record's phone number.
     */
    handleCall() {
        const phone = this.recordData?.phone;
        if (phone && phone !== '—') {
            const tel = phone.replace(/\D/g, '');
            if (tel.length) window.open(`tel:${tel}`, '_self');
        }
    }

    /**
     * Opens the default messaging app (or could navigate to Chatter/email). Uses phone for SMS if available.
     */
    handleMessage() {
        const phone = this.recordData?.phone;
        if (phone && phone !== '—') {
            const tel = phone.replace(/\D/g, '');
            if (tel.length) window.open(`sms:${tel}`, '_self');
        }
    }

    /**
     * Opens the default mail client with the record's email as recipient.
     */
    handleEmail() {
        const email = this.recordData?.email;
        if (email && email !== '—') {
            window.open(`mailto:${encodeURIComponent(email)}`, '_self');
        }
    }

    /**
     * Navigates to the customer record (Contact/Account) when the name is clicked.
     * Uses the Id of the record we are displaying, not the page record (e.g. on Case page, opens Contact).
     */
    handleNameClick() {
        const recordId = this._customerRecordId || this.effectiveRecordId;
        if (!recordId) return;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId,
                actionName: 'view'
            }
        });
    }

    /**
     * Navigates to the Account record when the Account name is clicked.
     */
    handleAccountClick() {
        const accountId = this.recordData?.accountId;
        if (!accountId) return;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: accountId,
                actionName: 'view'
            }
        });
    }
}