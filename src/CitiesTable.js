import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import Autocomplete from "react-autocomplete";
import "./CitiesTable.css";

const CitiesTable = () => {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL =
    "https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&q=&rows=20&start=";

  const fetchCities = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}${page * 20}`);
      const newCities = response.data.records.map((record) => ({
        name: record.fields.name || "N/A",
        country: record.fields.cou_name_en || "N/A",
        timezone: record.fields.timezone || "N/A",
        geoname_id: record.fields.geoname_id || null,
      }));
      setCities((prevCities) => [...prevCities, ...newCities]);
      setFilteredCities((prevCities) => [...prevCities, ...newCities]);
      if (newCities.length < 20) {
        setHasMore(false);
      }

      setPage(page + 1);
    } catch (error) {
      console.error("Error fetching cities", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);

    const filtered = cities.filter((city) =>
      city.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCities(filtered);
  };

  const filteredAutocompleteCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="cities-table cities-container">
      <Autocomplete
        getItemValue={(item) => item.name}
        items={filteredAutocompleteCities}
        renderItem={(item, isHighlighted) => (
          <div
            key={item.name}
            className={`autocomplete-item ${
              isHighlighted ? "highlighted" : ""
            }`}
          >
            {item.name}, {item.country}
          </div>
        )}
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
        onSelect={(value) => handleSearchChange(value)}
        inputProps={{
          placeholder: "Search cities...",
          className: "autocomplete-input",
        }}
        wrapperStyle={{ width: "100%" }}
      />

      <table className="city-table">
        <thead>
          <tr>
            <th>City</th>
            <th>Country</th>
            <th>Timezone</th>
          </tr>
        </thead>
        <tbody id="scrollable-tbody">
          <InfiniteScroll
            dataLength={filteredCities.length}
            next={() => {
              setPage((prevPage) => prevPage + 1);
              fetchCities();
            }}
            hasMore={hasMore}
            loader={<h4 className="loader">Loading more cities...</h4>}
            endMessage={<p>No more cities to show</p>}
            scrollableTarget="scrollable-tbody"
          >
            {filteredCities.map((city, index) => (
              <tr key={index}>
                <td>
                  <a
                    href={`https://openweathermap.org/city/${city.geoname_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {city.name}
                  </a>
                </td>
                <td>{city.country}</td>
                <td>{city.timezone}</td>
              </tr>
            ))}
          </InfiniteScroll>
        </tbody>
      </table>
    </div>
  );
};

export default CitiesTable;
