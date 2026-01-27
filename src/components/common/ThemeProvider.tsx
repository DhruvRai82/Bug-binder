import { createContext, useContext, useEffect, useState } from "react"
import { themes, ThemeColor } from "@/lib/themes"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    defaultColor?: ThemeColor
    defaultRadius?: number
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
    color: ThemeColor
    setColor: (color: ThemeColor) => void
    radius: number
    setRadius: (radius: number) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
    color: "zinc",
    setColor: () => null,
    radius: 0.5,
    setRadius: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = "system",
    defaultColor = "zinc",
    defaultRadius = 0.5,
    storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    )
    const [color, setColor] = useState<ThemeColor>(
        () => (localStorage.getItem(`${storageKey}-color`) as ThemeColor) || defaultColor
    )
    const [radius, setRadius] = useState<number>(
        () => parseFloat(localStorage.getItem(`${storageKey}-radius`) || String(defaultRadius))
    )

    useEffect(() => {
        const root = window.document.documentElement

        // 1. Handle Light/Dark Mode
        root.classList.remove("light", "dark")
        let activeTheme = theme
        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light"
            root.classList.add(systemTheme)
            activeTheme = systemTheme
        } else {
            root.classList.add(theme)
        }

        // 2. Handle Color Theme
        const themeConfig = themes.find(t => t.name === color) || themes[0]
        const cssVars = themeConfig.cssVars[activeTheme as "light" | "dark"]

        Object.entries(cssVars).forEach(([key, value]) => {
            root.style.setProperty(key, value)
        })

        // 3. Handle Radius
        root.style.setProperty("--radius", `${radius}rem`)

    }, [theme, color, radius])

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
        color,
        setColor: (color: ThemeColor) => {
            localStorage.setItem(`${storageKey}-color`, color)
            setColor(color)
        },
        radius,
        setRadius: (radius: number) => {
            localStorage.setItem(`${storageKey}-radius`, String(radius))
            setRadius(radius)
        },
    }

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
