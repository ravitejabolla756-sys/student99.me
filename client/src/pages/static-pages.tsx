import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function PageLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back-home">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold font-display">
            stu<span className="text-primary">DEN</span>t99
          </h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <h2 className="text-3xl font-bold mb-6">{title}</h2>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {children}
        </div>
      </main>
    </div>
  );
}

export function About() {
  return (
    <PageLayout title="About StuDENT">
      <p className="text-lg text-muted-foreground mb-6">
        StuDENT is the ultimate productivity platform designed specifically for students.
      </p>

      <h3>Our Mission</h3>
      <p>
        We believe every student deserves access to powerful productivity tools without barriers.
        That's why StuDENT offers 99 completely free tools with no login required and no hidden costs.
      </p>

      <h3>What We Offer</h3>
      <ul>
        <li><strong>14 Calculators</strong> - From basic math to GPA calculations</li>
        <li><strong>15 Image Tools</strong> - Resize, crop, compress, and convert images</li>
        <li><strong>10 PDF Tools</strong> - Merge, split, rotate, and manage PDFs</li>
        <li><strong>15 Media Tools</strong> - Audio and video processing</li>
        <li><strong>10 Student Tools</strong> - Notes, to-dos, timers, and planners</li>
        <li><strong>12 Text & Writing Tools</strong> - Word counter, case converter, and more</li>
        <li><strong>10 Finance Tools</strong> - Loan calculators, budgeting, and planning</li>
        <li><strong>13 Utilities</strong> - Password generator, QR codes, and more</li>
      </ul>

      <h3>Privacy First</h3>
      <p>
        All tools run entirely in your browser. Your files and data never leave your device,
        ensuring complete privacy and security.
      </p>

      <h3>Built for Students</h3>
      <p>
        Whether you're in high school or university, StuDENT has the tools you need to
        succeed in your academic journey. Fast, reliable, and always free.
      </p>
    </PageLayout>
  );
}

export function Privacy() {
  return (
    <PageLayout title="Privacy Policy">
      <p className="text-muted-foreground mb-6">Last updated: December 2024</p>

      <h3>Overview</h3>
      <p>
        StuDENT is committed to protecting your privacy. This policy explains how we handle
        your information when you use our platform.
      </p>

      <h3>Data Collection</h3>
      <p>
        <strong>We do not collect personal data.</strong> StuDENT operates entirely in your browser.
        Your files, calculations, and documents are processed locally on your device and are never
        uploaded to our servers.
      </p>

      <h3>Local Storage</h3>
      <p>
        Some tools (like Notes Manager and To-Do List) use your browser's local storage to save
        your data between sessions. This data stays on your device and can be cleared at any time
        through your browser settings.
      </p>

      <h3>No Tracking</h3>
      <p>
        We do not use tracking cookies, analytics services, or any form of user tracking.
        Your usage of StuDENT is completely anonymous.
      </p>

      <h3>Third-Party Services</h3>
      <p>
        StuDENT does not integrate with any third-party services that collect user data.
      </p>

      <h3>Contact</h3>
      <p>
        If you have questions about this privacy policy, please reach out to us through our website.
      </p>
    </PageLayout>
  );
}

export function Terms() {
  return (
    <PageLayout title="Terms of Service">
      <p className="text-muted-foreground mb-6">Last updated: December 2024</p>

      <h3>Acceptance of Terms</h3>
      <p>
        By accessing and using StuDENT, you accept and agree to be bound by these Terms of Service.
      </p>

      <h3>Use of Service</h3>
      <p>
        StuDENT provides free productivity tools for educational purposes. You may use these tools
        for personal, educational, or commercial purposes.
      </p>

      <h3>Disclaimer</h3>
      <p>
        All tools are provided "as is" without warranty of any kind. We strive for accuracy but
        cannot guarantee that all calculations or conversions are error-free. Always verify
        important results independently.
      </p>

      <h3>AI-Style Tools Notice</h3>
      <p>
        Our AI-style tools (Essay Generator, Summarizer, etc.) use rule-based text processing
        and are labeled as "Basic AI Engine - V1". These tools provide suggestions and should
        be reviewed and edited before use in academic submissions.
      </p>

      <h3>Intellectual Property</h3>
      <p>
        Content you create using StuDENT tools remains your property. The StuDENT platform,
        including its design and functionality, is protected by copyright.
      </p>

      <h3>Limitation of Liability</h3>
      <p>
        StuDENT is not liable for any damages arising from the use of our tools, including
        but not limited to data loss, calculation errors, or academic consequences.
      </p>

      <h3>Changes to Terms</h3>
      <p>
        We reserve the right to modify these terms at any time. Continued use of StuDENT
        after changes constitutes acceptance of the new terms.
      </p>
    </PageLayout>
  );
}

export function Help() {
  return (
    <PageLayout title="Help Center">
      <h3>Getting Started</h3>
      <p>
        Welcome to StuDENT! Here's how to make the most of our 99 free tools:
      </p>

      <ol>
        <li>Use the <strong>search bar</strong> to find tools by name or keyword</li>
        <li>Browse tools by <strong>category</strong> on the dashboard</li>
        <li>Click any tool card to open and start using it</li>
        <li>Your work in student tools is <strong>saved automatically</strong></li>
      </ol>

      <h3>Calculator Tools</h3>
      <p>
        Our 14 calculators cover everything from basic arithmetic to GPA calculations.
        All calculations happen instantly in your browser.
      </p>

      <h3>Image Tools</h3>
      <p>
        Upload images by clicking the drop zone or dragging and dropping. Processed images
        can be downloaded immediately. Supported formats: JPG, PNG, WebP.
      </p>

      <h3>PDF Tools</h3>
      <p>
        Merge, split, rotate, and manage PDF files directly in your browser. All processing
        is done locally - your files are never uploaded to any server.
      </p>

      <h3>Student Tools</h3>
      <p>
        Notes, to-dos, and schedules are saved in your browser's local storage. Your data
        persists between sessions but is tied to the current browser.
      </p>

      <h3>AI-Style Tools</h3>
      <p>
        These tools use rule-based text processing (labeled "Basic AI Engine - V1").
        They provide helpful suggestions but should be reviewed before use.
      </p>

      <h3>Tips for Best Results</h3>
      <ul>
        <li>Use Chrome or Firefox for best compatibility</li>
        <li>Allow pop-ups for file downloads</li>
        <li>Keep your browser updated</li>
        <li>Clear local storage to reset student tools if needed</li>
      </ul>
    </PageLayout>
  );
}

export function Settings() {
  return (
    <PageLayout title="Settings">
      <p className="text-muted-foreground mb-6">
        Configure your StuDENT experience. Settings are saved in your browser.
      </p>

      <div className="space-y-6">
        <div className="p-4 bg-card rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-2">Theme</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Switch between light and dark mode using the toggle in the header.
          </p>
        </div>

        <div className="p-4 bg-card rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-2">Clear Local Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            To clear all saved data (notes, to-dos, etc.), clear your browser's local storage
            for this site in your browser settings.
          </p>
        </div>

        <div className="p-4 bg-card rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-2">Browser Compatibility</h3>
          <p className="text-sm text-muted-foreground">
            StuDENT works best in modern browsers: Chrome, Firefox, Safari, and Edge.
            Ensure your browser is up to date for the best experience.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
