import { useState, useEffect, useCallback } from 'react';
import type { BreedingData, BreedingPokemon, BreedingStatus } from '../types/breeding';

const STORAGE_KEY = 'pokemon-breeding-data';

export const useBreedingData = () => {
  const [data, setData] = useState<BreedingData>({ pokemons: [] });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(parsed);
      } catch (error) {
        console.error('Failed to parse breeding data:', error);
      }
    }
  }, []);

  const saveData = useCallback((newData: BreedingData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  }, []);

  const addBreedingPokemon = useCallback((
    pokemonId: number,
    pokemonName: string,
    target: BreedingPokemon['target']
  ) => {
    const newPokemon: BreedingPokemon = {
      id: crypto.randomUUID(),
      pokemonId,
      pokemonName,
      status: '保留',
      target,
      current: {
        subskills: [],
        ingredients: [],
        nature: '',
        level: 1,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newData = {
      ...data,
      pokemons: [...data.pokemons, newPokemon],
    };
    saveData(newData);
  }, [data, saveData]);

  const updateBreedingPokemon = useCallback((id: string, updates: Partial<BreedingPokemon>) => {
    const newData = {
      ...data,
      pokemons: data.pokemons.map(p => 
        p.id === id 
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      ),
    };
    saveData(newData);
  }, [data, saveData]);

  const deleteBreedingPokemon = useCallback((id: string) => {
    const newData = {
      ...data,
      pokemons: data.pokemons.filter(p => p.id !== id),
    };
    saveData(newData);
  }, [data, saveData]);

  const updateStatus = useCallback((id: string, status: BreedingStatus) => {
    updateBreedingPokemon(id, { status });
  }, [updateBreedingPokemon]);

  return {
    data,
    addBreedingPokemon,
    updateBreedingPokemon,
    deleteBreedingPokemon,
    updateStatus,
  };
};