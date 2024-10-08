import React, { useContext, useEffect, useRef, useState } from "react";
import PaddingTop from "../components/PaddingTop";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Checkbox,
  Chip,
  IconButton,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Rating,
  Spinner,
  Textarea,
  Tooltip,
  Typography,
} from "@material-tailwind/react";
import RaiseAlert2 from "../components/Alerts/RaiseAlert2";
import { MainContext } from "../context/MainContext";
import { CEpisodeAPI } from "../API/CEpisodeAPI";
import moment from "moment";
import CommentCard from "../components/Episode/CommentCard";
import { VideoJSWatch } from "../components/SwiperVideo/SampleVideojs/VideoJSWatch";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/outline";

export default function SingleEpisode() {
  const navigateTo = useNavigate();
  const { episodeSlug } = useParams();
  const { user, reply, comment } = useContext(MainContext);
  const [slug, setSlug] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [Episode, setEpisode] = useState({});
  const [videoJsOptions, setvideoJsOptions] = useState({});
  const txtAreaRef = useRef();
  const [showAlert, setshowAlert] = useState(null);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchEpisode = async (episodeId) => {
    const res2 = await CEpisodeAPI.getSingleEpisode(episodeId);
    if (res2?.status === "success") {
      setEpisode(res2.data.data);
      setvideoJsOptions({
        controls: true,
        // responsive: true,
        playbackRates: [0.25, 0.5, 1, 1.5, 2],
        autoplay: false,
        poster: res2.data.data?.images.thumbnail[0].source,
        sources: [
          {
            src: res2.data.data?.video[0]?.vids[0].link,
            type: res2.data.data?.video[0]?.vids[0].mimeType,
          },
        ],
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (episodeSlug) {
      setSlug(episodeSlug);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (slug) {
        const res = await CEpisodeAPI.GetEpisodeCount(`&slug=${slug}`);
        if (res?.status === "success") {
          if (res.data.data.length > 0) {
            const episodeId = res.data.data[0]._id;
            fetchEpisode(episodeId);
          } else {
            navigateTo("/error");
          }
        } else {
          navigateTo("/error");
        }
      }
    }
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setshowAlert(false);
      }, 2400);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [showAlert]);

  useEffect(() => {
    fetchEpisode(Episode._id);
  }, [reply, comment]);

  if (isLoading) {
    // Show a loading spinner or placeholder while fetching the user data
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div>
          <Spinner className="h-16 w-16" color="purple" />
        </div>
        <Typography
          className="text-center mt-2 changa-one"
          variant="h3"
          color="blue"
        >
          DarShare
        </Typography>

        <Typography className="text-center mt-2" variant="h5">
          Loading...
        </Typography>
      </div>
    );
  }

  const handelPostComment = async () => {
    const comment = txtAreaRef.current.children[0].value;
    if (user) {
      if (comment && Episode._id) {
        const res = await CEpisodeAPI.createCommentOnEpisode(
          Episode._id,
          comment
        );
        // console.log(res);
        if (res?.status === "success") {
          setStatus(res.status);
          setMessage("Comment Created Successfully!");
          setshowAlert(true);
          txtAreaRef.current.children[0].value = "";
          fetchEpisode(Episode._id);
        } else {
          setStatus(res.status);
          setMessage(res.message);
          setshowAlert(true);
        }
      }
    } else {
      setStatus("fail");
      setMessage("You Should Login first");
      setshowAlert(true);
    }
  };

  const handelEpisodes = (goTo) => {
    const oldslug = Episode.slug.split("-e");
    let newEp = "e";
    if (goTo === "next") {
      newEp += (Episode.sequenceNumber + 1).toString();
      oldslug[1] = newEp;
      const newSlug = oldslug[0] + "-" + oldslug[1];
      navigateTo(`/episode/${newSlug}`);
      setIsLoading(true);
      setSlug(newSlug);
    } else if (goTo === "prev") {
      newEp += (Episode.sequenceNumber - 1).toString();
      oldslug[1] = newEp;
      const newSlug = oldslug[0] + "-" + oldslug[1];
      navigateTo(`/episode/${newSlug}`);
      setIsLoading(true);
      setSlug(newSlug);
    }
  };

  return (
    <div>
      <PaddingTop />
      <div className=" w-full h-[15rem] sm:h-15 md:h-[30rem] lg:h-[40rem] flex relative overflow-hidden">
        <VideoJSWatch options={videoJsOptions} />
      </div>

      <div className="bg-black">
        <div className="ml-[4.156rem] pt-[2rem] mr-[4.156rem]">
          <div className="flex gap-3 justify-between">
            <Tooltip content="Previous">
              <IconButton
                onClick={() => {
                  handelEpisodes("prev");
                }}
                color="pink"
                className="rounded-full"
              >
                <ArrowLeftCircleIcon className="w-7 h-7" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Next">
              <IconButton
                onClick={() => {
                  handelEpisodes("next");
                }}
                color="pink"
                className="rounded-full"
              >
                <ArrowRightCircleIcon className="w-7 h-7" />
              </IconButton>
            </Tooltip>
          </div>

          <div className="mt-2"></div>
          <Typography color="white" variant="h2">
            {Episode.name}
          </Typography>
          <Typography className="text-[#d4d4d4]" variant="p">
            Arabic - Sub
          </Typography>

          <div className="flex gap-12 mt-5">
            <div>
              <Typography className="text-[#f142a2] font-bold" variant="p">
                Number
              </Typography>
              <Typography color="white" variant="p">
                {Episode.number}
              </Typography>
            </div>
            <div>
              <Typography className="text-[#f142a2] font-bold" variant="p">
                Duration
              </Typography>
              <Typography color="white" variant="p">
                {Episode.minutes}
              </Typography>
            </div>
            <div>
              <Typography className="text-[#f142a2] font-bold" variant="p">
                Comments
              </Typography>
              <Typography color="white" variant="p">
                {Episode.commentsCount}
              </Typography>
            </div>
          </div>

          <div className="flex gap-10 mt-5">
            <div>
              <Typography className="text-[#f142a2] font-bold" variant="p">
                Type
              </Typography>
              <Typography color="white" variant="p">
                {Episode.mediaType}
              </Typography>
            </div>
            <div>
              <Typography className="text-[#f142a2] font-bold" variant="p">
                Filler
              </Typography>

              {Episode.filler ? (
                <Typography color="white" variant="p">
                  Yes
                </Typography>
              ) : (
                <Typography color="white" variant="p">
                  Have Content
                </Typography>
              )}
            </div>

            <div>
              <Typography className="text-[#f142a2] font-bold" variant="p">
                Premium
              </Typography>

              {Episode.premium ? (
                <Typography color="white" variant="p">
                  Yes
                </Typography>
              ) : (
                <Typography color="white" variant="p">
                  Free
                </Typography>
              )}
            </div>
          </div>

          <div className="mt-5">
            <Typography className="text-[#f142a2] font-bold" variant="p">
              Released on
            </Typography>
            <Typography color="white" variant="p">
              {moment(Episode.createdAt).format("dddd D/MM/YYYY")}
            </Typography>
          </div>

          <div className="mt-5">
            <Typography className="text-[#f142a2] font-bold" variant="p">
              Description
            </Typography>
            <Typography color="white" variant="p">
              {Episode.summary}
            </Typography>
          </div>

          <hr className="mt-5" />
          <div className="flex gap-3 mt-5">
            <Typography className="text-[#f142a2] font-bold" variant="p">
              Comments
            </Typography>
            <Typography color="white" variant="p">
              ({Episode.commentsCount})
            </Typography>
          </div>
          {showAlert && <RaiseAlert2 state={status} message={message} />}
          <div className="mt-5">
            <Textarea
              ref={txtAreaRef}
              variant="static"
              className="text-white"
              placeholder="Your Comment"
              rows={2}
            />
            <div className="w-full flex justify-between py-1.5">
              <div className="flex gap-2">
                <Button
                  onClick={handelPostComment}
                  size="sm"
                  className="rounded-md"
                >
                  Post Comment
                </Button>
              </div>
            </div>

            {Episode.comments && (
              <div className="mt-5 grid lg:grid-cols-1 gap-6 p-5">
                {Episode.comments.map((comment) => {
                  return <CommentCard key={comment._id} comment={comment} />;
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
