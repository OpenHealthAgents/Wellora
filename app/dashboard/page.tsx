import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DashboardView from "@/components/DashboardView";
import { getDetectedRegion } from "@/lib/region-server";
import { getPlanPriceForRegion, PlanPriceRow } from "@/lib/pricing";

type DashboardOrder = {
  id: string;
  status: string;
  createdAt: Date;
  plan: {
    drugType: string;
    tier: string;
    prices: PlanPriceRow[];
    durationMonths: number;
  };
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const region = await getDetectedRegion();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      orders: {
        include: {
          plan: {
            include: {
              prices: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      intake: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  const getPriceValue = (prices: PlanPriceRow[]) => {
    return getPlanPriceForRegion(prices, region);
  };

  // Current plan is the most recent order
  const latestOrder = user.orders[0];
  const latestOrderPrice = latestOrder ? getPriceValue(latestOrder.plan.prices) : null;
  const currentPlan = latestOrder
    ? {
        drugType: latestOrder.plan.drugType,
        tier: latestOrder.plan.tier,
        price: latestOrderPrice!.amount,
        currency: latestOrderPrice!.currency,
        durationMonths: latestOrder.plan.durationMonths,
        status: latestOrder.status,
        createdAt: latestOrder.createdAt.toISOString(),
      }
    : undefined;

  const dashboardData = {
    user: {
      email: user.email,
      name: user.name,
    },
    region,
    currentPlan,
    orders: user.orders.map((o: DashboardOrder) => {
      const price = getPriceValue(o.plan.prices);

      return {
        id: o.id,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
        plan: {
          drugType: o.plan.drugType,
          tier: o.plan.tier,
          price: price.amount,
          currency: price.currency,
          durationMonths: o.plan.durationMonths,
        },
      };
    }),
    intake: user.intake
      ? {
          weight: user.intake.weight,
          goalWeight: user.intake.goalWeight,
        }
      : undefined,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <DashboardView data={dashboardData as any} />;
}
