import React, { createContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
export const CountryContext = createContext();

export const CountryProvider = ({ children }) => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/countries`)
      .then(res => res.json())
      .then(data => {
        setCountries(data);

        if (!data.length) return;

        const india = data.find(country =>
          country.code === 'IN' || country.code === 'IND' || country.name?.toLowerCase() === 'india'
        );
        const defaultCountry = india || data[0];

        setSelectedCountry(defaultCountry);
        localStorage.setItem('country', defaultCountry.code);
      });
  }, []);

  return (
    <CountryContext.Provider value={{ countries, selectedCountry, setSelectedCountry }}>
      {children}
    </CountryContext.Provider>
  );
};
