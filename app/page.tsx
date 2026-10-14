"use client";

import { Flame, ShoppingBag, ShoppingCart, Timer, Truck } from 'lucide-react';
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Section, SectionHeader } from "@/components/blocks/shared";
import CTA from "@/components/blocks/CTA";
import FeatureGrid, { type FeatureItem } from "@/components/blocks/FeatureGrid";
import Hero from "@/components/blocks/Hero";
import Testimonials, { type TestimonialItem } from "@/components/blocks/Testimonials";
import { Reveal } from "@/components/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type MenuCategory = "biryani" | "rolls" | "chaat" | "desserts" | "drinks";
type SpiceLevel = "mild" | "medium" | "hot";

type MenuItem = {
  id: string;
  category: MenuCategory;
  name: string;
  description: string;
  price: string;
  image: string;
  spice: SpiceLevel;
};

type CartEntry = { item: MenuItem; qty: number };

const CATEGORIES: MenuCategory[] = ["biryani", "rolls", "chaat", "desserts", "drinks"];
const STEP_ICONS = [ShoppingBag, Flame, Truck];

function parsePrice(price: string): number {
  const parsed = Number.parseFloat(price.replace(/[^0-9.]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export default function Page() {
  const t = useTranslations("home");
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const menuItems = Array.isArray(t.raw("menu.items")) ? (t.raw("menu.items") as MenuItem[]) : [];
  const howItWorksSteps = Array.isArray(t.raw("howItWorks.steps")) ? (t.raw("howItWorks.steps") as { title: string; description: string }[]) : [];
  const reviewItems = Array.isArray(t.raw("reviews.items")) ? (t.raw("reviews.items") as TestimonialItem[]) : [];

  const howItWorksItems: FeatureItem[] = howItWorksSteps.map((step, i) => {
    const Icon = STEP_ICONS[i % STEP_ICONS.length];
    return { title: step.title, description: step.description, icon: <Icon className="h-6 w-6" /> };
  });

  const cartCount = cart.reduce((sum, entry) => sum + entry.qty, 0);
  const subtotal = cart.reduce((sum, entry) => sum + parsePrice(entry.item.price) * entry.qty, 0);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((entry) => entry.item.id === item.id);
      if (existing) {
        return prev.map((entry) => (entry.item.id === item.id ? { ...entry, qty: entry.qty + 1 } : entry));
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((entry) => (entry.item.id === id ? { ...entry, qty: entry.qty + delta } : entry))
        .filter((entry) => entry.qty > 0),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((entry) => entry.item.id !== id));
  };

  return (
    <main>
      <Hero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        primaryCta={{ label: t("hero.primaryCta"), href: "#menu" }}
        secondaryCta={{ label: t("hero.secondaryCta"), href: "#menu" }}
        image={{ src: "https://titoaistorageaccount.blob.core.windows.net/titoai-storage/site-images/398e675504784c7a843121852883053d.jpg", alt: "Overhead shot of a signature saffron biryani platter with charred naan and raita" }}
        variant="mesh"
      />

      <Section id="menu" className="bg-muted/30">
        <Reveal>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <SectionHeader eyebrow={t("menu.eyebrow")} title={t("menu.title")} subtitle={t("menu.subtitle")} />
            <Button variant="outline" className="shrink-0" onClick={() => setCartOpen(true)}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {t("cart.title")}
              {cartCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>

          <Tabs defaultValue="biryani" className="mt-8">
            <TabsList className="flex-wrap">
              {CATEGORIES.map((category) => {
                const categoryLabels: Record<MenuCategory, string> = {
                  biryani: t("menu.categories.biryani"),
                  rolls: t("menu.categories.rolls"),
                  chaat: t("menu.categories.chaat"),
                  desserts: t("menu.categories.desserts"),
                  drinks: t("menu.categories.drinks"),
                };
                return (
                  <TabsTrigger key={category} value={category}>
                    {categoryLabels[category]}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {CATEGORIES.map((category) => (
              <TabsContent key={category} value={category}>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {menuItems
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <div key={item.id} className="relative overflow-hidden rounded-2xl border border-border bg-card surface-elevated">
                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          <Badge className="absolute right-3 top-3 gap-1">
                            <Flame className="h-3 w-3" />
                            {item.spice === "mild" ? t("menu.spice.mild") : item.spice === "medium" ? t("menu.spice.medium") : t("menu.spice.hot")}
                          </Badge>
                        </div>
                        <div className="p-5">
                          <h3 className="font-display text-lg font-semibold">{item.name}</h3>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="font-semibold text-primary">{item.price}</span>
                            <Button size="sm" onClick={() => addToCart(item)}>
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              {t("menu.addToCart")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Reveal>
      </Section>

      <button
        type="button"
        onClick={() => setCartOpen(true)}
        aria-label={t("cart.title")}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-primary p-4 text-primary-foreground shadow-glow transition hover:-translate-y-1 motion-reduce:transition-none"
      >
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background text-xs font-semibold text-foreground">
            {cartCount}
          </span>
        )}
      </button>

      <Sheet open={cartOpen} onOpenChange={setCartOpen} side="right" title={t("cart.title")}>
        {cart.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("cart.empty")}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {cart.map((entry) => (
              <div key={entry.item.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{entry.item.name}</p>
                  <p className="text-sm text-muted-foreground">{entry.item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => updateQty(entry.item.id, -1)} aria-label="-">
                    -
                  </Button>
                  <span className="w-5 text-center text-sm font-medium">{entry.qty}</span>
                  <Button size="icon" variant="outline" onClick={() => updateQty(entry.item.id, 1)} aria-label="+">
                    +
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeFromCart(entry.item.id)}>
                    {t("cart.remove")}
                  </Button>
                </div>
              </div>
            ))}

            <Separator className="my-4" />

            <div className="flex items-center justify-between text-sm font-semibold">
              <span>{t("cart.subtotal")}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>
                {t("cart.deliveryEstimate")} {t("cart.deliveryTime")}
              </span>
            </div>

            <Button className="mt-4 w-full" size="lg" onClick={() => setCartOpen(false)}>
              {t("cart.checkout")}
            </Button>
          </div>
        )}
      </Sheet>

      <FeatureGrid
        id="how-it-works"
        eyebrow={t("howItWorks.eyebrow")}
        title={t("howItWorks.title")}
        subtitle={t("howItWorks.subtitle")}
        items={howItWorksItems}
        columns={3}
        variant="minimal"
      />

      <Testimonials
        id="reviews"
        eyebrow={t("reviews.eyebrow")}
        title={t("reviews.title")}
        subtitle={t("reviews.subtitle")}
        items={reviewItems}
        variant="glass"
      />

      <CTA
        id="contact"
        title={t("finalCta.title")}
        subtitle={t("finalCta.subtitle")}
        primaryCta={{ label: t("finalCta.primaryCta"), href: "#menu" }}
        secondaryCta={{ label: t("finalCta.secondaryCta"), href: "#menu" }}
        image={{ src: "https://titoaistorageaccount.blob.core.windows.net/titoai-storage/site-images/0e93b1db43e248eeb6dd0c168fffa8b5.jpg", alt: "Delivery rider carrying hot food bags on a scooter at night" }}
        variant="gradient"
      />
    </main>
  );
}
