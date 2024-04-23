import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../../util/http";
import { useState } from "react";
import LoadingIndicator from "../UI/LoadingIndicator";
import ErrorBlock from "../UI/ErrorBlock";
import EventItem from "./EventItem";
export default function FindEventSection() {
  const searchElement = useRef();
  const [searchTerm, setSearchTerm] = useState();
  const {data, error, isError, isPending,isLoading} = useQuery({
    queryKey: ["events", { search: searchTerm }],
    queryFn: ({signal}) => fetchEvents({signal,searchTerm}),
    enabled: searchTerm!==undefined, // 是否启用查询
  });
  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(searchElement.current.value);
  }
  let content = <p>Please enter a search term and to find events.</p>;
  if (isLoading) {
    content = <LoadingIndicator />;
  }
  if (isError) {
    content = (
      <ErrorBlock
        title={"an ERROR occurred"}
        message={error?.info?.message || "fail to fetch"}
      />
    );
  }
  if (data) {
    content = (
      <ul>
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      </header>
      {content}
    </section>
  );
}
