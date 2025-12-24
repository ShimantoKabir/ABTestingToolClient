"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // 1. Get the token (Updated name to 'access-token' to match your middleware)
    const match = document.cookie.match(
      new RegExp("(^| )access-token=([^;]+)")
    );
    const token = match ? match[2] : null;

    // 2. Define Routes (Copied from your middleware)
    const protectedRoutes = ["/dashboard", "/profile"];
    const unProtectedRoutes = ["/", "/login", "/registration"];

    // 3. Check current path
    // Using .includes() matches the strict '===' logic of your middleware
    const isProtectedRoute = protectedRoutes.includes(pathname);
    const isUnprotectedRoute = unProtectedRoutes.includes(pathname);

    // --- LOGIC START ---

    // Case A: User has token AND is on an unprotected route (e.g. Login, Home)
    // Redirect to Dashboard
    if (token && isUnprotectedRoute) {
      setAuthorized(false);
      router.push("/dashboard");
    }
    // Case B: User has NO token AND is on a protected route (e.g. Dashboard)
    // Redirect to Login
    else if (!token && isProtectedRoute) {
      setAuthorized(false);
      router.push("/login");
    }
    // Case C: All other cases are allowed
    else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  // Prevent "flash of content" by hiding the app until the check is done
  if (!authorized) {
    return null; // You can replace this with <LoadingSpinner /> if you want
  }

  return <>{children}</>;
}
