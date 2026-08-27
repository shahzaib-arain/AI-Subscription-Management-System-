import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { subscriptionApi, alertApi, SubscriptionData, AlertData } from "../services/api";

interface SubscriptionsContextType {
  subscriptions: SubscriptionData[];
  alerts: AlertData[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  pauseSubscription: (id: number) => Promise<void>;
  resumeSubscription: (id: number) => Promise<void>;
  cancelSubscription: (id: number) => Promise<void>;
  markAlertRead: (id: number) => Promise<void>;
}

const SubscriptionsContext = createContext<SubscriptionsContextType | undefined>(undefined);

export const SubscriptionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The single place this data is ever fetched — called whenever a token
  // becomes available (login, sign-up, cold start) and by every screen's
  // pull-to-refresh, so there's exactly one fetch path to keep correct.
  const load = async (activeToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const [subscriptionsRes, alertsRes] = await Promise.all([
        subscriptionApi.getSubscriptions(activeToken),
        alertApi.getAlerts(activeToken),
      ]);
      setSubscriptions(subscriptionsRes.data);
      setAlerts(alertsRes.data);
    } catch (e: any) {
      setError(e.message || "Failed to load subscriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      load(token);
    } else {
      setSubscriptions([]);
      setAlerts([]);
      setError(null);
    }
  }, [token]);

  const refresh = async () => {
    if (!token) return;
    await load(token);
  };

  const pauseSubscription = async (id: number) => {
    if (!token) return;
    const response = await subscriptionApi.pause(token, id);
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? response.data : s)));
  };

  const resumeSubscription = async (id: number) => {
    if (!token) return;
    const response = await subscriptionApi.resume(token, id);
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? response.data : s)));
  };

  const cancelSubscription = async (id: number) => {
    if (!token) return;
    const response = await subscriptionApi.cancel(token, id);
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? response.data : s)));
  };

  const markAlertRead = async (id: number) => {
    if (!token) return;
    const response = await alertApi.markRead(token, id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? response.data : a)));
  };

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions,
        alerts,
        loading,
        error,
        refresh,
        pauseSubscription,
        resumeSubscription,
        cancelSubscription,
        markAlertRead,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionsContext);
  if (context === undefined) {
    throw new Error("useSubscriptions must be used within a SubscriptionsProvider");
  }
  return context;
};
