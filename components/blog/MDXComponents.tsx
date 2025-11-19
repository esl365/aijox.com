/**
 * MDX Custom Components
 *
 * Custom React components for use in MDX blog posts
 */

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Custom Link component
 */
function CustomLink({
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isInternal = href?.startsWith('/') || href?.startsWith('#');

  if (isInternal && href) {
    return <Link href={href} {...props} />;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
      {...props}
    />
  );
}

/**
 * Custom Image component
 */
function CustomImage({
  src,
  alt,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  if (!src) return null;

  // For external images, use regular img tag
  if (typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'))) {
    return (
      <img
        src={src}
        alt={alt || ''}
        className="rounded-lg my-6 w-full"
        {...props}
      />
    );
  }

  // For local images, use Next.js Image component
  return (
    <div className="my-6">
      <Image
        src={src}
        alt={alt || ''}
        width={1200}
        height={600}
        className="rounded-lg w-full h-auto"
        {...(props as any)}
      />
    </div>
  );
}

/**
 * Callout component for important notes
 */
export function Callout({
  type = 'info',
  title,
  children,
}: {
  type?: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  children: React.ReactNode;
}) {
  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
  };

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅',
    error: '❌',
  };

  return (
    <div
      className={`my-6 rounded-lg border-l-4 p-4 ${colors[type]}`}
      role="alert"
    >
      {title && (
        <div className="flex items-center gap-2 font-semibold mb-2">
          <span>{icons[type]}</span>
          <span>{title}</span>
        </div>
      )}
      <div className="prose-sm">{children}</div>
    </div>
  );
}

/**
 * Comparison table component
 */
export function ComparisonTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<Array<string | number>>;
}) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            {headers.map((header, i) => (
              <th
                key={i}
                className="border border-border px-4 py-2 text-left font-semibold"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="even:bg-muted/50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border border-border px-4 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Highlight box for key takeaways
 */
export function HighlightBox({
  title = 'Key Takeaways',
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="my-6 border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="prose-sm">{children}</CardContent>
    </Card>
  );
}

/**
 * Step-by-step guide component
 */
export function StepGuide({
  steps,
}: {
  steps: Array<{ title: string; description: string }>;
}) {
  return (
    <div className="my-6 space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              {index + 1}
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">{step.title}</h4>
            <p className="text-muted-foreground">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Pros and Cons component
 */
export function ProsCons({
  pros,
  cons,
}: {
  pros: string[];
  cons: string[];
}) {
  return (
    <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="text-lg text-green-900">
            ✅ Pros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {pros.map((pro, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span className="text-green-900">{pro}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="text-lg text-red-900">
            ❌ Cons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {cons.map((con, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-600">•</span>
                <span className="text-red-900">{con}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Tag list component
 */
export function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
        </Badge>
      ))}
    </div>
  );
}

/**
 * Export all custom components for MDX
 */
export const MDXComponents = {
  // Override default HTML elements
  a: CustomLink,
  img: CustomImage,

  // Custom components
  Callout,
  ComparisonTable,
  HighlightBox,
  StepGuide,
  ProsCons,
  TagList,

  // Preserve default components
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
};
