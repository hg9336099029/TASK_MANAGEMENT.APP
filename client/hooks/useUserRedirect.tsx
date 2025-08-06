"use client";
import { useUserContext } from "@/context/userContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const useRedirect = (redirect: string) => {
  const { user, loading } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user._id)) {
      router.push(redirect);
    }
  }, [user, loading, redirect, router]);
};

export default useRedirect;
