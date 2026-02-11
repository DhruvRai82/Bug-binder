export const themes = [
    {
        name: "zinc",
        label: "Zinc",
        activeColor: {
            light: "240 5.9% 10%",
            dark: "0 0% 98%",
        },
        cssVars: {
            light: {
                "--primary": "240 5.9% 10%",
                "--primary-foreground": "0 0% 98%",
                "--ring": "240 5.9% 10%",
                "--sidebar-accent": "240 4.8% 95.9%",
                "--sidebar-accent-foreground": "240 5.9% 10%",
            },
            dark: {
                "--primary": "0 0% 98%",
                "--primary-foreground": "240 5.9% 10%",
                "--ring": "0 0% 98%",
                "--sidebar-accent": "240 3.7% 15.9%",
                "--sidebar-accent-foreground": "0 0% 98%",
            },
        },
    },
    {
        name: "blue",
        label: "Blue",
        activeColor: {
            light: "221.2 83.2% 53.3%",
            dark: "217.2 91.2% 59.8%",
        },
        cssVars: {
            light: {
                "--primary": "221.2 83.2% 53.3%",
                "--primary-foreground": "210 40% 98%",
                "--ring": "221.2 83.2% 53.3%",
                "--sidebar-accent": "221.2 83.2% 96%",
                "--sidebar-accent-foreground": "221.2 83.2% 20%",
            },
            dark: {
                "--primary": "217.2 91.2% 59.8%",
                "--primary-foreground": "222.2 47.4% 11.2%",
                "--ring": "217.2 91.2% 59.8%",
                "--sidebar-accent": "217.2 91.2% 20%",
                "--sidebar-accent-foreground": "217.2 91.2% 95%",
            },
        },
    },
    {
        name: "violet",
        label: "Violet",
        activeColor: {
            light: "262.1 83.3% 57.8%",
            dark: "263.4 70% 50.4%",
        },
        cssVars: {
            light: {
                "--primary": "262.1 83.3% 57.8%",
                "--primary-foreground": "210 40% 98%",
                "--ring": "262.1 83.3% 57.8%",
                "--sidebar-accent": "262.1 83.3% 96%",
                "--sidebar-accent-foreground": "262.1 83.3% 25%",
            },
            dark: {
                "--primary": "263.4 70% 50.4%",
                "--primary-foreground": "210 40% 98%",
                "--ring": "263.4 70% 50.4%",
                "--sidebar-accent": "263.4 70% 20%",
                "--sidebar-accent-foreground": "263.4 70% 95%",
            },
        },
    },
    {
        name: "orange",
        label: "Orange",
        activeColor: {
            light: "24.6 95% 53.1%",
            dark: "20.5 90.2% 48.2%",
        },
        cssVars: {
            light: {
                "--primary": "24.6 95% 53.1%",
                "--primary-foreground": "60 9.1% 97.8%",
                "--ring": "24.6 95% 53.1%",
                "--sidebar-accent": "24.6 95% 96%",
                "--sidebar-accent-foreground": "24.6 95% 25%",
            },
            dark: {
                "--primary": "20.5 90.2% 48.2%",
                "--primary-foreground": "60 9.1% 97.8%",
                "--ring": "20.5 90.2% 48.2%",
                "--sidebar-accent": "20.5 90.2% 20%",
                "--sidebar-accent-foreground": "20.5 90.2% 95%",
            },
        },
    },
    {
        name: "green",
        label: "Green",
        activeColor: {
            light: "142.1 76.2% 36.3%",
            dark: "142.1 70.6% 45.3%",
        },
        cssVars: {
            light: {
                "--primary": "142.1 76.2% 36.3%",
                "--primary-foreground": "355.7 100% 97.3%",
                "--ring": "142.1 76.2% 36.3%",
                "--sidebar-accent": "142.1 76.2% 96%",
                "--sidebar-accent-foreground": "142.1 76.2% 20%",
            },
            dark: {
                "--primary": "142.1 70.6% 45.3%",
                "--primary-foreground": "144.9 80.4% 10%",
                "--ring": "142.1 70.6% 45.3%",
                "--sidebar-accent": "142.1 70.6% 20%",
                "--sidebar-accent-foreground": "142.1 70.6% 95%",
            },
        },
    },
    {
        name: "red",
        label: "Red",
        activeColor: {
            light: "346.8 77.2% 49.8%",
            dark: "346.8 77.2% 49.8%",
        },
        cssVars: {
            light: {
                "--primary": "346.8 77.2% 49.8%",
                "--primary-foreground": "355.7 100% 97.3%",
                "--ring": "346.8 77.2% 49.8%",
                "--sidebar-accent": "346.8 77.2% 96%",
                "--sidebar-accent-foreground": "346.8 77.2% 25%",
            },
            dark: {
                "--primary": "346.8 77.2% 49.8%",
                "--primary-foreground": "355.7 100% 97.3%",
                "--ring": "346.8 77.2% 49.8%",
                "--sidebar-accent": "346.8 77.2% 20%",
                "--sidebar-accent-foreground": "346.8 77.2% 95%",
            },
        },
    },
] as const;

export type ThemeColor = (typeof themes)[number]["name"];
