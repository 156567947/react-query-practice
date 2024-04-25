import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery,useMutation } from "@tanstack/react-query";
import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent,updateEvent,queryClient } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
  const {isLoading:updateLoading,isError:isEpdateError,error:updateError,mutate} = useMutation({
    mutationKey:["events",params.id],
    mutationFn:updateEvent,
    onMutate:async (data)=>{
      await queryClient.cancelQueries(["events",params.id]);
      const prevEvent=queryClient.getQueryData(["events",params.id]);
      queryClient.setQueryData(["events",params.id],data.event);
      return {prevEvent}
    },
    onError:(error,data,context)=>{
      queryClient.setQueryData(["events",params.id],context.prevEvent);
    },
    onSettled:()=>{
      queryClient.invalidateQueries(["events",params.id]);
    }
  })

  function handleSubmit(formData) {
    mutate({
      id:params.id,
      event:formData
    })
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }
  let content;
  if (isLoading) {
    content = (
      <div className="center">
        <LoadingIndicator />
        <div className="form-actions">
          <Link to={"../"} className="button">
            Okay
          </Link>
        </div>
      </div>
    );
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title={"获取详情信息失败"}
          message={error.info?.message || "请稍候再试"}
        />
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }
  return <Modal onClose={handleClose}>{content}</Modal>;
}
