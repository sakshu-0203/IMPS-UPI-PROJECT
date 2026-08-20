# Dashboard flow fix

Flow:
Angular Dashboard -> DashboardService -> GET /api/dashboard/summary -> dashboardController -> MySQL transactions

The service also falls back to GET /api/transactions if the dashboard summary endpoint fails.

Verify in this order:
1. npm run dev in backend
2. Open http://localhost:5000/api/health
3. Open http://localhost:5000/api/dashboard/summary
4. npm start in frontend
5. Open Dashboard and check browser console for [Dashboard] logs
