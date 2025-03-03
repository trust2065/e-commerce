import { count, countDistinct, isNotNull, sql, sum } from 'drizzle-orm';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { db } from '../../drizzle/db';
import { CourseSectionTable, CourseTable, LessonTable, ProductTable, PurchaseTable, UserCourseAccessTable } from '../../drizzle/schema';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getPurchaseGlobalTag } from '../../features/purchases/db/cache';
import { getCourseGlobalTag } from '../../features/courses/db/cache/courses';
import { getUserCourseAccessGlobalTag } from '../../features/courses/db/cache/userCourseAccess';
import { getCourseSectionGlobalTag } from '../../features/courseSections/db/cache';
import { getLessonGlobalTag } from '../../features/lessons/db/cache/lessons';
import { getProductGlobalTag } from '../../features/products/db/cache';
import { formatNumber, formatPrice } from '../../lib/formatters';

export default async function AdminPage() {
  const { averageNetPurchasesPerCustomer, netPurchases, netSales, refundedPurchases, totalRefunds } = await getPurchaseDetails();
  const totalCourses = await getTotalCourses();
  const totalProducts = await getTotalProducts();
  const totalLessons = await getTotalLessons();
  const totalStudents = await getTotalStudents();
  const totalCourseSections = await getTotalCourseSections();

  return (
    <div className='container my-6'>
      <PageHeader title='Admin'></PageHeader>
      <div className='grid grid-cols-2 lg:grid-cols-5 sm:grid-cols-3 gap-4'>
        <StatCard title='Sales' >
          {formatPrice(netSales)}
        </StatCard>
        <StatCard title='Refunds Sales' >
          {formatPrice(refundedPurchases)}
        </StatCard>
        <StatCard title='Purchases' >
          {formatNumber(netPurchases)}
        </StatCard>
        <StatCard title='Refunded purchases' >
          {formatNumber(totalRefunds)}
        </StatCard>
        <StatCard title='Purchases Per User' >
          {formatNumber(averageNetPurchasesPerCustomer, { maximumFractionDigits: 2 })}
        </StatCard>
        <StatCard title='Products' >
          {formatNumber(totalProducts)}
        </StatCard>
        <StatCard title='Courses' >
          {formatNumber(totalCourses)}
        </StatCard>
        <StatCard title='Lessons' >
          {formatNumber(totalLessons)}
        </StatCard>
        <StatCard title='Students' >
          {formatNumber(totalStudents)}
        </StatCard>
        <StatCard title='Course Sections' >
          {formatNumber(totalCourseSections)}
        </StatCard>
      </div>
    </div>
  );
}

function StatCard({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className='text-center'>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="font-bold text-2xl">{children}</CardTitle>
      </CardHeader>
    </Card>
  );
}

// This is just another way to get getPurchaseDetails
// I wanna get 
//  total sales amount/count
//  total refunds amount/count
//  total products count
//  total courses count
//  total lessons count
//  total customers count
//  average customer sale
// async function getSales() {
//   'use cache';
//   cacheTag(getPurchaseGlobalTag());

//   const result = await db
//     .select({
//       totalSales: countDistinct(PurchaseTable.id),
//       // 'sum' is returning string | null, convert to number
//       totalSalesAmount: sum(PurchaseTable.pricePaidInCents).mapWith(Number),
//       totalRefunds: countDistinct(sql`CASE WHEN ${PurchaseTable.refundedAt} IS NOT NULL THEN ${PurchaseTable.id} END`),
//       totalRefundAmount: sum(sql`CASE WHEN ${PurchaseTable.refundedAt} IS NOT NULL THEN ${PurchaseTable.pricePaidInCents} ELSE 0 END`).mapWith(Number),
//     })
//     .from(PurchaseTable);

//   const totalSales = result[0]?.totalSales ?? 0;
//   const totalSalesAmount = result[0]?.totalSalesAmount ?? 0;
//   const totalRefunds = result[0]?.totalRefunds ?? 0;
//   const totalRefundAmount = result[0]?.totalRefundAmount ?? 0;

//   return {
//     totalSales,
//     totalSalesAmount,
//     totalRefunds,
//     totalRefundAmount,
//   };
// }

async function getPurchaseDetails() {
  'use cache';
  cacheTag(getPurchaseGlobalTag());

  const data = await db
    .select({
      totalSales: sql<number>`COALESCE(${sum(
        PurchaseTable.pricePaidInCents
      )}, 0)`.mapWith(Number),
      totalPurchases: count(PurchaseTable.id),
      totalUsers: countDistinct(PurchaseTable.userId),
      isRefund: isNotNull(PurchaseTable.refundedAt),
    })
    .from(PurchaseTable)
    .groupBy(table => table.isRefund);

  const [refundData] = data.filter(row => row.isRefund);
  const [salesData] = data.filter(row => !row.isRefund);

  const netSales = (salesData?.totalSales ?? 0) / 100;
  const netPurchases = salesData?.totalPurchases ?? 0;
  const totalRefunds = (refundData?.totalSales ?? 0) / 100;
  const refundedPurchases = refundData?.totalPurchases ?? 0;
  const averageNetPurchasesPerCustomer =
    salesData?.totalUsers != null && salesData.totalUsers > 0
      ? netPurchases / salesData.totalUsers
      : 0;

  return {
    netSales,
    totalRefunds,
    netPurchases,
    refundedPurchases,
    averageNetPurchasesPerCustomer,
  };
}

async function getTotalStudents() {
  "use cache";
  cacheTag(getUserCourseAccessGlobalTag());

  const [data] = await db
    .select({ totalStudents: countDistinct(UserCourseAccessTable.userId) })
    .from(UserCourseAccessTable);

  if (data == null) return 0;
  return data.totalStudents;
}

async function getTotalCourses() {
  "use cache";
  cacheTag(getCourseGlobalTag());

  const [data] = await db
    .select({ totalCourses: count(CourseTable.id) })
    .from(CourseTable);

  if (data == null) {
    return 0;
  }

  return data.totalCourses;
}

async function getTotalProducts() {
  "use cache";
  cacheTag(getProductGlobalTag());

  const [data] = await db
    .select({ totalProducts: count(ProductTable.id) })
    .from(ProductTable);

  if (data == null) {
    return 0;
  }

  return data.totalProducts;
}

async function getTotalLessons() {
  "use cache";
  cacheTag(getLessonGlobalTag());

  const [data] = await db
    .select({ totalLessons: count(LessonTable.id) })
    .from(LessonTable);

  if (data == null) {
    return 0;
  }

  return data.totalLessons;
}

async function getTotalCourseSections() {
  "use cache";
  cacheTag(getCourseSectionGlobalTag());

  const [data] = await db
    .select({ totalCourseSections: count(CourseSectionTable.id) })
    .from(CourseSectionTable);

  if (data == null) {
    return 0;
  }

  return data.totalCourseSections;
}