"use client"

import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado inicial com valor do localStorage ou valor padrão
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Erro ao ler localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Função para salvar no localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permitir que value seja uma função para atualização baseada no valor anterior
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      setStoredValue(valueToStore)
      
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Erro ao salvar no localStorage key "${key}":`, error)
    }
  }

  // Função para remover do localStorage
  const removeValue = () => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Erro ao remover localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue, removeValue] as const
}
