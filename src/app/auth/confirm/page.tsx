import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { MainLayout } from '@/components/main-layout';

export default function EmailConfirmationPage() {
  return (
    <MainLayout>
        <div className="flex items-center justify-center py-12 px-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Check Your Email</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        We've sent a confirmation link to your email address.
                    </p>
                    <p>
                        Please click the link in the email to complete your registration and verify your account.
                    </p>
                    <div className="mt-6">
                        <Link href="/login" className="text-sm text-primary hover:underline">
                            Return to Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    </MainLayout>
  );
}
