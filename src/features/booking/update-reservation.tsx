import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { useAuth } from "@/contexts/auth-context";
import { Booking, bookingDate, bookingTime, errorText } from "./model";
import { listBookings, updateSeatReservation } from "./repository";
import { SEATS } from "./seat-layout";
import { Button, C, DateField, ErrorBox, Page, styles, TimeField } from "./ui";

export function UpdateReservationButton({ booking }: { booking: Booking }) {
  const { account } = useAuth();
  const [now, setNow] = useState(() => Date.now());
  useFocusEffect(
    useCallback(() => {
      setNow(Date.now());
      const timer = setInterval(() => setNow(Date.now()), 30000);
      return () => clearInterval(timer);
    }, []),
  );
  if (
    !SEATS.some(
      (seat) => seat.id === booking.resource_id && seat.role === account?.role,
    ) ||
    booking.kind !== "seat" ||
    booking.status !== "reserved" ||
    new Date(booking.start_at).getTime() <= now
  )
    return null;

  return (
    <Button
      title="Update Reservation"
      outline
      onPress={() =>
        router.push({
          pathname: "/booking/update-reservation",
          params: { id: booking.id },
        })
      }
    />
  );
}

export default function UpdateReservationScreen() {
  const { account, isLoading: authLoading } = useAuth();
  const role = account?.role;
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("09");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const locked = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      if (authLoading) {
        setLoading(true);
        return () => {
          mounted = false;
        };
      }
      if (!role) {
        setLoading(false);
        setBooking(null);
        setError("Select your account role before editing a seat.");
        return () => {
          mounted = false;
        };
      }
      setLoading(true);
      setError("");
      setSaved(false);
      setBooking(null);
      void listBookings()
        .then((rows) => {
          if (!mounted) return;
          const found = rows.find((row) => row.id === id);
          if (!found || found.kind !== "seat")
            throw new Error("Seat reservation not found.");
          if (
            !SEATS.some(
              (seat) => seat.id === found.resource_id && seat.role === role,
            )
          )
            throw new Error(
              "This seat is not available for your current account role.",
            );
          if (
            found.status !== "reserved" ||
            new Date(found.start_at).getTime() <= Date.now()
          ) {
            throw new Error(
              "Only future reservations that have not been checked in can be updated.",
            );
          }
          const localStart = new Date(
            new Date(found.start_at).getTime() + 330 * 60000,
          );
          setBooking(found);
          setDate(localStart.toISOString().slice(0, 10));
          setSlot(String(localStart.getUTCHours()).padStart(2, "0"));
        })
        .catch((cause) => {
          if (mounted) setError(errorText(cause));
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
      return () => {
        mounted = false;
      };
    }, [id, role, authLoading]),
  );

  async function save() {
    if (!booking || !role || locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      const updated = await updateSeatReservation(booking.id, date, slot, role);
      setBooking(updated);
      setSaved(true);
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  return (
    <Page title="Update Reservation" tabs={false}>
      {loading ? (
        <ActivityIndicator color={C.blue} />
      ) : booking ? (
        <>
          <View style={styles.card}>
            <Text style={styles.heading}>{booking.resource_label}</Text>
            <Text style={styles.text}>Floor {booking.floor}</Text>
            <Text style={styles.text}>
              {bookingDate(booking)} · {bookingTime(booking)}
            </Text>
          </View>
          {saved ? (
            <Text accessibilityRole="alert" style={styles.heading}>
              Reservation updated!
            </Text>
          ) : (
            <>
              <Text style={styles.text}>
                Choose a new date and time for this seat.
              </Text>
              <View pointerEvents={busy ? "none" : "auto"}>
                <DateField value={date} onChange={setDate} />
                <View style={{ height: 18 }} />
                <TimeField value={slot} onChange={setSlot} />
              </View>
              <ErrorBox message={error} />
              <Button
                title="Save Changes"
                busy={busy}
                onPress={() => {
                  void save();
                }}
              />
            </>
          )}
        </>
      ) : (
        <ErrorBox message={error} />
      )}
      <Button
        title={saved ? "View My Reservations" : "Back to My Reservations"}
        outline
        disabled={busy}
        onPress={() => router.replace("/booking/reservations")}
      />
    </Page>
  );
}
