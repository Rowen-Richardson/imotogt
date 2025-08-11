"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vehicle } from '@/types/vehicle';

interface LikedCarsContextType {
  likedCars: Vehicle[];
  addLikedCar: (car: Vehicle) => void;
  removeLikedCar: (carId: string) => void;
  isCarLiked: (carId: string) => boolean;
}

const LikedCarsContext = createContext<LikedCarsContextType | undefined>(undefined);

export const LikedCarsProvider = ({ children }: { children: ReactNode }) => {
  const [likedCars, setLikedCars] = useState<Vehicle[]>([]);

  useEffect(() => {
    try {
      const savedCars = localStorage.getItem('likedCars');
      if (savedCars) {
        setLikedCars(JSON.parse(savedCars));
      }
    } catch (error) {
      console.error('Failed to load liked cars from localStorage', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('likedCars', JSON.stringify(likedCars));
    } catch (error) {
      console.error('Failed to save liked cars to localStorage', error);
    }
  }, [likedCars]);

  const addLikedCar = (car: Vehicle) => {
    setLikedCars((prevCars) => [...prevCars, car]);
  };

  const removeLikedCar = (carId: string) => {
    setLikedCars((prevCars) => prevCars.filter((car) => car.id !== carId));
  };

  const isCarLiked = (carId: string) => {
    return likedCars.some((car) => car.id === carId);
  };

  return (
    <LikedCarsContext.Provider value={{ likedCars, addLikedCar, removeLikedCar, isCarLiked }}>
      {children}
    </LikedCarsContext.Provider>
  );
};

export const useLikedCars = () => {
  const context = useContext(LikedCarsContext);
  if (context === undefined) {
    throw new Error('useLikedCars must be used within a LikedCarsProvider');
  }
  return context;
};