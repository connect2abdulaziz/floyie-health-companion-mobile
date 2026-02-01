import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useContentPadding } from "@/hooks/useContentPadding";
import {
  fetchAISuggestions,
  getSuggestionTypeLabel,
  getSuggestionTypeClassName,
  SUGGESTION_TYPE_OPTIONS,
  type AISuggestion,
  type SuggestionType,
} from "@/services/floHistory";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/dashboard/EmptyState";

const ITEMS_PER_PAGE = 20;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function FloHistoryScreen() {
  const insets = useSafeAreaInsets();
  const contentPadding = useContentPadding({ stackScreen: true });
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const filterType = filter === "all" ? undefined : (filter as SuggestionType);
    const data = await fetchAISuggestions(
      user.id,
      ITEMS_PER_PAGE + 1,
      page * ITEMS_PER_PAGE,
      filterType
    );
    setHasMore(data.length > ITEMS_PER_PAGE);
    setSuggestions(data.slice(0, ITEMS_PER_PAGE));
  }, [user, filter, page]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      load().finally(() => setLoading(false));
    } else {
      setSuggestions([]);
      setLoading(false);
    }
  }, [user, filter, page]);

  const onRefresh = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    setPage(0);
    const filterType = filter === "all" ? undefined : (filter as SuggestionType);
    const data = await fetchAISuggestions(user.id, ITEMS_PER_PAGE + 1, 0, filterType);
    setHasMore(data.length > ITEMS_PER_PAGE);
    setSuggestions(data.slice(0, ITEMS_PER_PAGE));
    setRefreshing(false);
  }, [user, filter]);

  if (!user) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-center text-base text-gray-600">Sign in to view Flo history.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={contentPadding}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5b8def" />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-4 text-base text-gray-500">
          Past wellness suggestions from Flo
        </Text>

        {/* Filter row: horizontal scroll of pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-1 mb-4"
          contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
        >
          {SUGGESTION_TYPE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => {
                setFilter(opt.value);
                setPage(0);
              }}
              activeOpacity={0.9}
              className={`rounded-full px-4 py-2 ${
                filter === opt.value ? "bg-primary" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  filter === opt.value ? "text-white" : "text-gray-600"
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading && suggestions.length === 0 ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#5b8def" />
            <Text className="mt-4 text-sm text-gray-500">Loading…</Text>
          </View>
        ) : suggestions.length === 0 ? (
          <EmptyState
            icon="sparkles"
            title="No insights yet"
            description="Chat with Flo to receive personalized wellness suggestions."
          />
        ) : (
          <View className="gap-3">
            {suggestions.map((s) => (
              <Card key={s.id} className="border-gray-200">
                <CardContent className="py-4">
                  <View className="mb-2 flex-row flex-wrap items-center justify-between gap-2">
                    <View
                      className={`rounded-lg px-2 py-1 ${getSuggestionTypeClassName(
                        s.suggestion_type
                      )}`}
                    >
                      <Text className="text-xs font-medium text-gray-700">
                        {getSuggestionTypeLabel(s.suggestion_type)}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="time-outline" size={14} color="#9ca3af" />
                      <Text className="text-xs text-gray-500">
                        {formatDate(s.created_at)}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm leading-relaxed text-gray-800">
                    {s.suggestion_text}
                  </Text>
                </CardContent>
              </Card>
            ))}
          </View>
        )}

        {/* Pagination */}
        {suggestions.length > 0 && (
          <View className="mt-6 flex-row items-center justify-between border-t border-gray-200 pt-4">
            <TouchableOpacity
              onPress={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2"
              activeOpacity={0.9}
            >
              <View className="flex-row items-center gap-1">
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={page === 0 ? "#d1d5db" : "#374151"}
                />
                <Text
                  className={`text-sm font-medium ${page === 0 ? "text-gray-400" : "text-gray-700"}`}
                >
                  Previous
                </Text>
              </View>
            </TouchableOpacity>
            <Text className="text-sm text-gray-500">Page {page + 1}</Text>
            <TouchableOpacity
              onPress={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2"
              activeOpacity={0.9}
            >
              <View className="flex-row items-center gap-1">
                <Text
                  className={`text-sm font-medium ${
                    !hasMore ? "text-gray-400" : "text-gray-700"
                  }`}
                >
                  Next
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={!hasMore ? "#d1d5db" : "#374151"}
                />
              </View>
            </TouchableOpacity>
          </View>
        )}

        <Card className="mt-6 border-gray-200 bg-gray-50">
          <CardContent className="py-3 px-4">
            <Text className="text-center text-xs text-gray-500">
              Flo provides general guidance only. Consult a doctor for medical advice.
            </Text>
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
}
