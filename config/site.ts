// Export a TypeScript type for siteConfig so it can be used elsewhere (e.g., to type props or components)
export type SiteConfig = typeof siteConfig;

// Main site configuration object
export const siteConfig = {
    // -----------------------------------
    // Basic metadata
    // -----------------------------------

    name: "Next.js + HeroUI",
    // Name of the site — used in header, title, metadata, etc.

    description: "Make beautiful websites regardless of your design experience.",
    // A short description of the site for SEO and social media previews

    // -----------------------------------
    // Primary navigation items (e.g., top navbar)
    // -----------------------------------
    navItems: [
        {
            label: "Home", // Display name for nav item
            href: "/",     // URL path to navigate to
        },
        {
            label: "Docs",
            href: "/docs",
        },
        {
            label: "Pricing",
            href: "/pricing",
        },
        {
            label: "Blog",
            href: "/blog",
        },
        {
            label: "About",
            href: "/about",
        },
    ],
    // These are shown prominently in the navigation bar or mobile drawer

    // -----------------------------------
    // Navigation menu items (e.g., user dropdown or sidebar menu)
    // -----------------------------------
    navMenuItems: [
        {
            label: "Profile",       // Takes user to their personal profile
            href: "/profile",
        },
        {
            label: "Dashboard",     // Main app dashboard
            href: "/dashboard",
        },
        {
            label: "Projects",      // List of projects user is part of
            href: "/projects",
        },
        {
            label: "Team",          // Team management section
            href: "/team",
        },
        {
            label: "Calendar",      // Calendar and events page
            href: "/calendar",
        },
        {
            label: "Settings",      // Account or app settings
            href: "/settings",
        },
        {
            label: "Help & Feedback", // Help center or feedback submission
            href: "/help-feedback",
        },
        {
            label: "Logout",        // Ends the user session
            href: "/logout",
        },
    ],
    // These might be shown in a dropdown under the user avatar or side drawer

    // -----------------------------------
    // External links to resources
    // -----------------------------------
    links: {
        github: "https://github.com/heroui-inc/heroui",
        // Link to the GitHub repository of the project or UI framework

        twitter: "https://twitter.com/hero_ui",
        // Twitter handle for project updates or announcements

        docs: "https://heroui.com",
        // Documentation homepage

        discord: "https://discord.gg/9b6yyZKmH4",
        // Community Discord for support, feedback, and collaboration

        sponsor: "https://patreon.com/jrgarciadev",
        // Sponsorship or donation link (optional for open-source devs)
    },
};
