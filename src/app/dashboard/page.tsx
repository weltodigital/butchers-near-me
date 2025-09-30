import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  Clock, 
  Users, 
  BarChart3, 
  Settings,
  Palette,
  Type,
  Layout,
  Zap
} from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Component Library
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Complete shadcn/ui ecosystem for MeatMap UK development
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">← Back to Home</Button>
            </Link>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Component Library Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Component Library
              </CardTitle>
              <CardDescription>
                Complete shadcn/ui component ecosystem (70+ components)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Form Components</h4>
                  <div className="space-y-2">
                    <Button size="sm">Button</Button>
                    <Button variant="outline" size="sm">Outline</Button>
                    <Button variant="secondary" size="sm">Secondary</Button>
                    <Button variant="ghost" size="sm">Ghost</Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Layout Components</h4>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-md text-sm">Card</div>
                    <div className="p-2 border rounded-md text-sm">Container</div>
                    <div className="p-2 border rounded-md text-sm">Grid</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  📚 <strong>Documentation:</strong>{' '}
                  <a 
                    href="https://ui.shadcn.com/docs/components" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-red-600 hover:underline"
                  >
                    https://ui.shadcn.com/docs/components
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Theme System Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme System
              </CardTitle>
              <CardDescription>
                CSS variables and color system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 bg-primary rounded"></div>
                  <div className="h-8 bg-secondary rounded"></div>
                  <div className="h-8 bg-accent rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  🎨 <strong>Themes:</strong>{' '}
                  <a 
                    href="https://ui.shadcn.com/themes" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-red-600 hover:underline"
                  >
                    https://ui.shadcn.com/themes
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Typography Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Typography
              </CardTitle>
              <CardDescription>
                Text hierarchy and styling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Heading 1</h1>
                <h2 className="text-xl font-semibold">Heading 2</h2>
                <h3 className="text-lg font-medium">Heading 3</h3>
                <p className="text-sm text-muted-foreground">Body text</p>
              </div>
            </CardContent>
          </Card>

          {/* Icons Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Lucide Icons
              </CardTitle>
              <CardDescription>
                Icon library integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                <Search className="h-6 w-6 text-slate-600" />
                <MapPin className="h-6 w-6 text-slate-600" />
                <Star className="h-6 w-6 text-slate-600" />
                <Phone className="h-6 w-6 text-slate-600" />
                <Clock className="h-6 w-6 text-slate-600" />
                <Users className="h-6 w-6 text-slate-600" />
                <BarChart3 className="h-6 w-6 text-slate-600" />
                <Settings className="h-6 w-6 text-slate-600" />
              </div>
              <div className="mt-3 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                📚 <a 
                  href="https://lucide.dev/docs/lucide-react/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline"
                >
                  Lucide React Docs
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Color Palette Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Palette
              </CardTitle>
              <CardDescription>
                Complete color system with CSS variables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Primary</h4>
                  <div className="space-y-1">
                    <div className="h-8 bg-primary rounded"></div>
                    <div className="h-6 bg-primary/80 rounded"></div>
                    <div className="h-4 bg-primary/60 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Secondary</h4>
                  <div className="space-y-1">
                    <div className="h-8 bg-secondary rounded"></div>
                    <div className="h-6 bg-secondary/80 rounded"></div>
                    <div className="h-4 bg-secondary/60 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Accent</h4>
                  <div className="space-y-1">
                    <div className="h-8 bg-accent rounded"></div>
                    <div className="h-6 bg-accent/80 rounded"></div>
                    <div className="h-4 bg-accent/60 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Muted</h4>
                  <div className="space-y-1">
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-6 bg-muted/80 rounded"></div>
                    <div className="h-4 bg-muted/60 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  🎨 <strong>Colors:</strong>{' '}
                  <a 
                    href="https://ui.shadcn.com/colors" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-red-600 hover:underline"
                  >
                    https://ui.shadcn.com/colors
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Installation Commands Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                CLI Commands
              </CardTitle>
              <CardDescription>
                shadcn/ui installation commands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm font-mono">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                  npx shadcn add button
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                  npx shadcn add card
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                  npx shadcn add form
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                  npx shadcn add dialog
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Ready to build your MeatMap UK butcher directory with this complete component ecosystem!
          </p>
        </div>
      </div>
    </div>
  )
}
