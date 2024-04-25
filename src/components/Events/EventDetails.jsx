import { Link, Outlet, useNavigate } from "react-router-dom";
import { useMutation, useQuery, QueryClient } from "@tanstack/react-query";
import Header from "../Header.jsx";
import { fetchEvent, deleteEvent } from "../../util/http.js";
import { useParams } from "react-router-dom";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { useState } from "react";
export default function EventDetails() {
  const [isDeleting,setIsDeleting]= useState(false);
  const navigate = useNavigate();
  const { mutate } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      QueryClient.invalidateQueries({ queryKey: ["events"] ,refetchType:'none'});
      navigate("/events");
    },
  });
  const params = useParams();
  const { data, error, isPending, isError } = useQuery({
    queryKey: ["event", params.id],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });
  function handleStartDelete(){
    setIsDeleting(true);
  }
  function handleCancelDelete(){
    setIsDeleting(false);
  }
  const handleDelete = () => {
    mutate({ id: params.id });
  };
  let content;
  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <p>loading...</p>
      </div>
    );
  }
  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock title="failed to load event" message={error.info.message} />
      </div>
    );
  }
  if (data) {
    const formatDate = new Date(data.date).toLocaleDateString("ZH-CN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formatDate}@{data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
