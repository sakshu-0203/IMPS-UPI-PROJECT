# API Logs Page - Quick Start Guide

## 🚀 Getting Started

The API Logs page is located at: `/monitoring/api-logs`

Navigate to it in your IMPS Dashboard to see the page in action.

---

## 📋 Features at a Glance

### Summary Cards
Shows 5 key metrics:
- Total Requests
- Successful Requests
- Failed Requests  
- Pending Requests
- Average Response Time

### Search & Filters
- Search by Request ID or Transaction ID
- Filter by API Name (9 different APIs)
- Filter by HTTP Method (GET, POST, PUT, DELETE)
- Filter by Status (Success, Failed, Pending, Timeout, Unauthorized)
- Filter by Date Range

### Results Table
10 columns showing:
- Timestamp
- API Name
- HTTP Method
- Endpoint
- Request ID
- Transaction ID
- HTTP Status Code
- Status
- Response Time
- View Details Button

### Pagination
- Shows 10 records per page
- Previous/Next navigation
- Direct page number selection

### Details Modal
Click "View Details" to see:
- Full request details (ID, timestamp, method, endpoint, etc.)
- Request headers (formatted JSON)
- Request body (formatted JSON)
- Response (formatted JSON)
- All sensitive data automatically masked

### Performance Overview
Quick stats showing:
- Success rate percentage
- Total requests count
- Average response time
- Requests breakdown by status

---

## 🔍 Common Tasks

### View All Logs
1. Open the API Logs page
2. Scroll through the table or use pagination

### Find a Specific Log
1. Enter Request ID in "Search by Request ID / Transaction ID"
2. Click "Search"
3. View filtered results

### Filter by API Type
1. Select API from "API Name" dropdown
2. Click "Search"
3. See only logs for that API

### See Request Details
1. Click "View Details" button on any log row
2. Modal opens showing all information
3. Scroll to see request headers, body, and response
4. Click "Close" to dismiss modal

### Reset All Filters
1. Click "Reset" button in the filter section
2. All filters are cleared
3. Full log list is displayed

### Refresh Data
1. Click "Refresh" button in the top right
2. Page reloads latest data from backend

---

## 🛡️ Sensitive Data

All sensitive information is automatically masked:
- Passwords → ****
- Account numbers → First 4 + last 4 + ***** in middle
- Tokens → First 4 + last 4 + ***** in middle
- OTPs, PINs, CVVs → ****
- Authorization headers → ****

This happens automatically in:
- All JSON displays
- Request/response bodies
- Request headers
- Modal details

---

## 📱 Mobile Friendly

The page adapts to your screen size:
- **Desktop** - Full layout with all columns
- **Tablet** - Reorganized layout, scrollable table
- **Mobile** - Single column views, full-width buttons, optimized modal

---

## 🔌 Backend Integration

### Is Your Backend Ready?
The page connects to: `http://localhost:5000/api/operations/monitoring/api-logs`

**If the backend is working:**
- Real API logs are displayed
- Filters work with server-side filtering (if supported)

**If the backend is down:**
- Demo data is automatically shown
- You'll see: "Showing demo data (backend not connected)"
- All features still work with the demo data
- No changes needed - it's automatic!

---

## ⚙️ Customization Tips

### Change Number of Records Per Page
In `api-logs.ts`, find:
```typescript
pageSize = 10;
```
Change `10` to your desired page size (e.g., `20`, `50`, etc.)

### Add New API Names
In `api-logs.ts`, find:
```typescript
apiNames = [
  'IMPS Transfer',
  'Account Verification',
  // ... add more here
];
```

### Change Colors
Edit the CSS variables in `api-logs.css`. Look for:
- `.summary-card` - Card colors
- `.status-badge` - Status colors
- `.method-badge` - Method colors

---

## 🐛 Troubleshooting

### No Data Showing
1. Ensure backend API is running on `http://localhost:5000`
2. Check browser console for errors (F12)
3. Page will show demo data if backend is unavailable

### Filters Not Working
1. Try clicking "Reset" first
2. Then apply one filter at a time
3. Click "Search" button after changing filters

### Modal Won't Close
1. Click the X button in top right of modal
2. Or click outside the modal
3. Or press Escape key (if implemented)

### Performance Issues
1. Reduce date range in filters
2. Try searching by specific Request ID
3. Reduce page size if needed

---

## 📞 Support

If you need to:
- Add more filter options - Edit filter arrays in component
- Change styling - Modify CSS file
- Add new columns - Update table HTML and add data bindings
- Integrate with real backend - Update API endpoint in service

All modifications are straightforward - the code is well-commented and structured.

---

## ✅ You're All Set!

The API Logs page is ready to use. Navigate to `/monitoring/api-logs` to get started! 🎉
