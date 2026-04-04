import { BookingStatus, UserRole } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";

interface Actor {
  id: string;
  role: UserRole;
}

interface CreateBookingInput {
  propertyId: string;
  date: Date;
}

const bookingSelect = {
  id: true,
  userId: true,
  propertyId: true,
  date: true,
  status: true,
  createdAt: true,
  property: {
    select: {
      id: true,
      title: true,
      city: true,
      country: true,
      address: true,
      price: true,
      type: true,
      images: true,
    },
  },
} as const;

export const createBooking = async (payload: CreateBookingInput, userId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
    select: { id: true },
  });

  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  const booking = await prisma.booking.findUnique({
    where: {
      userId_propertyId_date: {
        userId,
        propertyId: payload.propertyId,
        date: payload.date,
      },
    },
    select: { id: true },
  });

  if (booking) {
    throw new ApiError(409, "You already booked this property for this date");
  }

  return prisma.booking.create({
    data: {
      userId,
      propertyId: payload.propertyId,
      date: payload.date,
      status: BookingStatus.PENDING,
    },
    select: bookingSelect,
  });
};

export const cancelBooking = async (bookingId: string, actor: Actor) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, userId: true },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  const canCancel = actor.role === UserRole.ADMIN || actor.role === UserRole.AGENT || booking.userId === actor.id;
  if (!canCancel) {
    throw new ApiError(403, "Forbidden: you cannot cancel this booking");
  }

  await prisma.booking.delete({
    where: { id: bookingId },
  });
};

export const getUserBookings = async (userId: string) => {
  return prisma.booking.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    select: bookingSelect,
  });
};

export const confirmBooking = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, status: true },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.status !== BookingStatus.PENDING) {
    throw new ApiError(400, "Only PENDING bookings can be confirmed");
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CONFIRMED },
    select: bookingSelect,
  });
};
