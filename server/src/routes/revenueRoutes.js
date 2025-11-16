import express from "express";

const router = express.Router();

const revenueFeatures = [
  {
    id: "subscription",
    title: "College Subscription Plans",
    description:
      "Tiered plans for colleges covering dashboards, certificates, attendance, and analytics.",
    priceRange: "₹10,000 - ₹50,000 / month",
    categories: ["Starter", "Pro", "Enterprise"],
    icon: "📊",
  },
  {
    id: "sponsored",
    title: "Sponsored Events & Ads",
    description:
      "Marketplace for sponsored posts, banners, and featured placement with CPC/CPM/CPL billing.",
    priceRange: "Varies by campaign",
    categories: ["Banner Ads", "Sponsored Posts", "Notification Blasts"],
    icon: "📣",
  },
  {
    id: "event-tools",
    title: "Paid Event Tools",
    description:
      "Advanced event builder, QR check-in, smart forms, and AI assistants for clubs.",
    priceRange: "₹199 - ₹999 per event",
    categories: ["Premium Host", "Smart Check-in", "AI Generator"],
    icon: "🎟️",
  },
  {
    id: "ticketing",
    title: "Ticketing Platform",
    description:
      "Support free, paid, VIP, and group tickets with promo codes and commission split.",
    priceRange: "5% - 15% commission",
    categories: ["Early Bird", "VIP", "Group Tickets"],
    icon: "🎫",
  },
  {
    id: "marketplace",
    title: "Student Store & Marketplace",
    description:
      "Internal marketplace for books, merchandise, and gadgets with a 10% - 20% commission.",
    priceRange: "10% - 20% commission",
    categories: ["Books", "Merch", "Second-hand"],
    icon: "🛒",
  },
  {
    id: "jobs",
    title: "Internship & Job Listings",
    description:
      "Paid job posts, featured internships, resume view access, and webinar plug-ins.",
    priceRange: "Pay per post or monthly",
    categories: ["Featured Jobs", "Auto-Recommend", "Sponsored Webinars"],
    icon: "💼",
  },
];

const revenueStats = [
  {
    label: "Active Colleges",
    value: "58",
    trend: "+12 in 30 days",
  },
  {
    label: "Sponsored Campaigns",
    value: "124",
    trend: "CPC avg ₹18",
  },
  {
    label: "Tickets Sold",
    value: "8,450",
    trend: "Avg ₹420",
  },
  {
    label: "Marketplace Sellers",
    value: "312",
    trend: "₹2.4L/month",
  },
];

router.get("/features", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      features: revenueFeatures,
      stats: revenueStats,
    },
  });
});

export default router;
