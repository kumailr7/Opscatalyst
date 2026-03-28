import { injectSpeedInsights } from "@vercel/speed-insights"
import { inject as injectAnalytics } from "@vercel/analytics"

injectSpeedInsights()
injectAnalytics()
