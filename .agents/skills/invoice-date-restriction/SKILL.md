---
name: invoice-date-restriction
description: Prevents invoicing on Sundays and manages holiday overrides using Google Calendar Pakistan Holidays.
---

# Skill: Invoice Date Restriction & Holiday Validation Engine

## 1. Overview
This module validates the invoice issuance date on the client/internal application side (completely isolated from external tax authorities like FBR). It prevents issuing invoices on Sundays and issues interactive confirmation warnings when the user selects a Pakistani gazetted/public holiday (including lunar holidays such as Eid-ul-Fitr, Eid-ul-Adha, etc.).

## 2. Google Calendar Free API Details (Pakistan Holidays)
Google provides a free, publicly accessible read-only calendar feed for national public holidays. It handles both fixed and moon-sighting (lunar) holidays without needing paid subscription endpoints.

* **API Base Endpoint:**
  `https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events`
* **Pakistan Public Holiday Calendar ID:**
  `en.pk#holiday@group.v.calendar.google.com`
* **Cost:** 100% Free
* **Setup Requirements:**
  1. Open Google Cloud Console -> Enable **Google Calendar API**.
  2. Create a public API Key.

## 3. Business Rules & Decision Matrix

| Condition | System Action | UI / User Experience | Override Action |
| :--- | :--- | :--- | :--- |
| **Normal Business Day** | Allow | No alert. Seamless entry. | N/A |
| **Sunday (`day === 0`)** | **BLOCK** | Red Alert: "Invoices cannot be created on Sundays." The submit button is strictly disabled. | **Not Allowed** |
| **Public / Eid Holiday** | **ALERT** | Yellow Alert Modal: "Warning: [Holiday Name] is an official public holiday." | **Force Issue** allowed only with mandatory `reason` text. |

## 4. Implementation Code Reference

```javascript
/**
 * Validates invoice date against Sunday restrictions and holiday lists.
 */
function validateInvoiceDate(inputDate, cachedHolidays, forceIssue = false, forceReason = '') {
    const dateObj = new Date(inputDate);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday

    // Rule 1: Strict Sunday Block
    if (dayOfWeek === 0) {
        return {
            allowed: false,
            status: 'BLOCKED',
            message: "Invoicing is strictly prohibited on Sundays.",
            allowOverride: false
        };
    }

    // Rule 2: Holiday Check
    const matchedHoliday = cachedHolidays.find(h => h.date === inputDate);

    if (matchedHoliday) {
        if (!forceIssue) {
            return {
                allowed: false,
                status: 'HOLIDAY_WARNING',
                holidayName: matchedHoliday.name,
                message: `Alert: Selected date is an official gazetted holiday (${matchedHoliday.name}).`,
                allowOverride: true
            };
        }

        if (forceIssue && (!forceReason || forceReason.trim().length < 5)) {
            return {
                allowed: false,
                status: 'REASON_REQUIRED',
                message: "Please enter a valid reason (min 5 characters) to force issue on an official holiday.",
                allowOverride: true
            };
        }

        return {
            allowed: true,
            status: 'OVERRIDDEN',
            message: `Invoice allowed under force-issue override. Reason logged: "${forceReason.trim()}".`,
            auditLog: {
                isHoliday: true,
                holidayName: matchedHoliday.name,
                reason: forceReason.trim()
            }
        };
    }

    // Rule 3: Clean working day
    return {
        allowed: true,
        status: 'PASSED',
        message: "Date verified successfully."
    };
}
```
