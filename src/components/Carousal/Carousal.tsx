import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createRef,
} from "react";
import * as Styles from "./Carousal.module.css";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import PauseIcon from "../../assets/pause-btn.svg";
import PlayIcon from "../../assets/play-btn.svg";
import LeftNavigationIcon from "../../assets/left-navigation-arrow.svg";
import RightNavigationIcon from "../../assets/right-navigation-arrow.svg";
import TickIcon from "../../assets/tick.svg";
import ProgressBar from "../ProgressBar";
import { Avatar, Button, CircularProgress, Dialog } from "@mui/material";
import { useAppSelector } from "../../app/hooks";
import { selectCarousalState } from "./Carousal.slice";
import debounce from "lodash/debounce";
import throttle from "lodash/throttle";
import toast, { Toaster } from "react-hot-toast";
import { useOnScreen } from "../../hooks/useOnScreen";
import { Media } from "./Carousal.types";
import NavigateNextOutlinedIcon from "@mui/icons-material/NavigateNextOutlined";
import NavigateBeforeOutlinedIcon from "@mui/icons-material/NavigateBeforeOutlined";
import { isFullyInViewport } from "../../utils/isFullyInViewport";
import { Share } from "@mui/icons-material";
import { useDetectAdBlock } from "adblock-detect-react";

const Carousel = ({
  open,
  setOpen,
  fireAnalytics,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fireAnalytics: Function;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { height, width } = useWindowDimensions();
  const [videoLoading, setVideoLoading] = useState(false);
  const [clickedIndex, setClickedIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [totalDuration, setTotalDuration] = useState(10);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerId, setTimerId] = useState(0);
  const [loadTimer, setLoadTimer] = useState(0);
  const [loadTimerId, setLoadTimerId] = useState(0);
  const [url, setUrl] = useState<Array<Media>>([]);
  const [totalPlayTime, setTotalPlayTime] = useState(0);
  const [loadPlayTime, setLoadPlayTime] = useState(0);
  const [is10Percent, setIs10Percent] = useState<boolean>(false);
  const [is25Percent, setIs25Percent] = useState<boolean>(false);
  const [is50Percent, setIs50Percent] = useState<boolean>(false);
  const [is75Percent, setIs75Percent] = useState<boolean>(false);
  const [is100Percent, setIs100Percent] = useState<boolean>(false);
  const [isTriggered, setIsTriggered] = useState<boolean>(false);
  const [isBuyNowClick, setIsBuyNowClick] = useState<boolean>(false);
  const [isHoveredIndex, setIsHoveredIndex] = useState<number | null>(null);
  const carousalState = useAppSelector(selectCarousalState);
  const divRef = useRef<HTMLDivElement>(null);
  const vidRef = useRef<HTMLVideoElement>(null);
  const vidTempRef = useRef<HTMLVideoElement>(null);
  const scrollDistance = 290;
  const [isPrevButtonDisabled, setIsPrevButtonDisabled] = useState(true);
  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(false);
  let isVisible = useOnScreen(divRef);
  const [bufferStartTime, setBufferStartTime] = useState(0);
  const [totalBufferTime, setTotalBufferTime] = useState(0);
  const [isOverLayOpened, setIsOverLayOpened] = useState(false);
  const adBlockDetected = useDetectAdBlock();
  const [pageViewTriggered, setPageViewTriggered] = useState(false);

  useEffect(() => {
    if (document.readyState === "complete") {
      const entries = performance.getEntriesByType("navigation");
      const lastEntry: any = entries[entries.length - 1];
      const pageLoadTime = lastEntry.loadEventEnd - lastEntry.startTime;
      let downlinkSpeed = 0;

      if ("connection" in navigator) {
        //only supported in select browsers (Chrome, Edge, Opera)
        //Capped at 10mb/s max to avoid performance issue
        downlinkSpeed = (navigator as any).connection.downlink;
      }

      fireAnalytics({
        category: "api_load_time",
        action: "api_load_time",
        value: carousalState.product.apiLoadTime,
      });

      if (
        carousalState.status === "idle" &&
        carousalState.product &&
        carousalState.product.media?.length! > 0
      ) {
        let analyticParameter = {
          category: "page_load_time_with_carousal",
          action: "page_load_time_with_carousal",
          value: {
            pageLoadTime: pageLoadTime - carousalState.product.apiLoadTime,
            downlinkSpeed: downlinkSpeed == 0 ? "NA" : downlinkSpeed,
          },
        };
        fireAnalytics(analyticParameter);
      } else {
        let analyticParameter = {
          category: "page_load_time_without_carousal",
          action: "page_load_time_without_carousal",
          value: {
            pageLoadTime: pageLoadTime - carousalState.product.apiLoadTime,
            downlinkSpeed: downlinkSpeed == 0 ? "NA" : downlinkSpeed,
          },
        };
        fireAnalytics(analyticParameter);
      }
    }
  }, [document.readyState]);
  const thumbnailRef = useRef<any[]>([]);
  thumbnailRef.current = url.map(
    (_, i) => thumbnailRef.current[i] ?? createRef()
  );

  useEffect(() => {
    let intervalId: any;
    if (isVisible) {
      intervalId = setInterval(() => {
        setTimer((prev: number) => (prev += 1));
      }, 1000);
      setTimerId(intervalId);
    } else {
      clearInterval(timerId);
      if (timer) {
        let analyticParameter = {
          category: "feed_interaction",
          action: "feed_interaction",
          value: timer,
        };
        fireAnalytics(analyticParameter);
      }

      setTimer(0);
    }

    const hasBeenTriggered = localStorage.getItem("first_view");

    if (isVisible && !hasBeenTriggered) {
      let analyticParameter = {
        category: "first_view",
        action: "first_view",
      };
      fireAnalytics(analyticParameter);
      localStorage.setItem("first_view", "true");
    }

    if (isVisible && !pageViewTriggered) {
      let analyticParameter = {
        category: "page_viewed",
        action: "page_viewed",
      };
      fireAnalytics(analyticParameter);

      setPageViewTriggered(true);
    }
    const cleanup = () => {
      setPageViewTriggered(false);
    };

    // Add the cleanup function to the beforeunload event
    window.addEventListener("beforeunload", cleanup);
    return () => {
      window.removeEventListener("beforeunload", cleanup);
      if (timer != 0) {
        clearInterval(timerId);
      }
    };
  }, [isVisible, pageViewTriggered]);

  useEffect(() => {
    let loadIntervalId: any;
    if (videoLoading) {
      loadIntervalId = setInterval(() => {
        setLoadTimer((prev: number) => (prev += 1));
      }, 1000);
      setLoadTimerId(loadIntervalId);
    } else {
      clearInterval(loadTimerId);
      if (loadTimer) {
        let analyticParameter = {
          category: "video_buffer",
          action: "video_buffer",
          videoId: url[clickedIndex]?._id,
          value: loadTimer,
        };
        fireAnalytics(analyticParameter);
      }

      setTimer(0);
    }

    return () => {
      if (loadTimerId != 0) {
        clearInterval(loadTimerId);
      }
    };
  }, [videoLoading]);

  useEffect(() => {
    if (carousalState?.product.media) {
      setUrl(carousalState?.product.media);
    }
  }, [carousalState.product]);

  const handleScroll = (e: any) => {
    if (divRef.current!.scrollLeft === 0) {
      setIsPrevButtonDisabled(true);
    } else {
      setIsPrevButtonDisabled(false);
    }

    if (
      divRef.current!.scrollLeft ===
      divRef.current!.scrollWidth - divRef.current!.clientWidth
    ) {
      setIsNextButtonDisabled(true);
    } else {
      setIsNextButtonDisabled(false);
    }
    let analyticParameter = {
      category: "feed_scrolled",
      action: "feed_scrolled",
    };
    fireAnalytics(analyticParameter);
  };

  const handleScrollDebounced = useCallback(debounce(handleScroll, 2000), []);

  const handelClick = (index: number, adhoc?: boolean) => {
    if (!adhoc) {
      let analyticParameter = {
        category: `${index + 1}_feed_thumbnail_video_click`,
        action: `${index + 1}_feed_thumbnail_video_click`,
        videoId: url[index]?._id,
      };
      fireAnalytics(analyticParameter);
    }
    setClickedIndex(index);
    setIsPlaying(true);
    setOpen(true);
    setVideoLoading(true);
    if (adhoc) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  //function to close the full screen of videos
  const closeFullScreen = (e?: React.MouseEvent<HTMLElement>) => {
    e && e.preventDefault();
    reportWatchTime();
    setClickedIndex(-1);
    hardRestProgressBar();
    setIsPlaying(false);
    setOpen(false);
    setIs25Percent(false);
    setIs50Percent(false);
    setIs75Percent(false);
    setIs100Percent(false);

    // User Exits Full screen

    let analyticParameter = {
      category: `${clickedIndex + 1}_video_player_exit`,
      action: `${clickedIndex + 1}_video_player_exit`,
      videoId: url[clickedIndex]?._id,
    };
    fireAnalytics(analyticParameter);

    // User Exits video in < 3 Seconds

    if (currentDuration < 3) {
      let analyticParameter = {
        category: `${clickedIndex + 1}_video_exit < 3s`,
        action: `${clickedIndex + 1}_video_exit < 3s`,
        videoId: url[clickedIndex]?._id,
      };
      fireAnalytics(analyticParameter);
    }
  };
  //function to mute and unmute the videos
  const handelMuteClick = (e?: React.MouseEvent<HTMLElement>) => {
    e && e.stopPropagation();
    setIsMuted((p) => !p);
  };
  useEffect(() => {
    if (isMuted) {
      // trigger event when video is muted
      let analyticParameter = {
        category: "video_muted",
        action: "video_muted",
        videoId: url[clickedIndex]?._id,
      };
      fireAnalytics(analyticParameter);
    }
  }, [isMuted]);

  //function to toggle the play and pause button videos
  const togglePlay = async () => {
    if (isPlaying) {
      vidRef.current?.pause();
    } else {
      await vidRef.current?.play();
    }
    setIsPlaying((p) => !p);
  };

  const videoProgress = () => {
    let videoCompletionRate = Math.round(
      (currentDuration / totalDuration) * 100
    );
    if (videoCompletionRate >= 8 && videoCompletionRate <= 12 && !is10Percent) {
      setIs10Percent(true);
      return 10;
    } else if (
      videoCompletionRate >= 23 &&
      videoCompletionRate <= 28 &&
      !is25Percent
    ) {
      setIs25Percent(true);
      return 25;
    } else if (
      videoCompletionRate >= 46 &&
      videoCompletionRate <= 52 &&
      !is50Percent
    ) {
      setIs50Percent(true);
      return 50;
    } else if (
      videoCompletionRate >= 72 &&
      videoCompletionRate <= 77 &&
      !is75Percent
    ) {
      setIs75Percent(true);
      return 75;
    } else if (videoCompletionRate >= 97 && !is100Percent) {
      setIs100Percent(true);
      return 100;
    }
  };

  //function to get the current duration of video every second
  const onProgress = (e: any) => {
    setCurrentDuration(e.target.currentTime);
    let videoCompletionRate = Math.round(
      (currentDuration / totalDuration) * 100
    );
    if (
      (videoCompletionRate >= 8 && videoCompletionRate <= 12 && !is10Percent) ||
      (videoCompletionRate >= 23 &&
        videoCompletionRate <= 28 &&
        !is25Percent) ||
      (videoCompletionRate >= 46 &&
        videoCompletionRate <= 52 &&
        !is50Percent) ||
      (videoCompletionRate >= 72 &&
        videoCompletionRate <= 77 &&
        !is75Percent) ||
      (videoCompletionRate >= 97 && !is100Percent)
    ) {
      const progress = videoProgress();
      if (progress != undefined) {
        let analyticParameter = {
          category: `${clickedIndex + 1}_video_completion_${progress}%`,
          action: `${clickedIndex + 1}_video_completion_${progress}%`,
          videoId: url[clickedIndex]._id,
          value: progress,
        };
        fireAnalytics(analyticParameter);
      }
    }

    if (currentDuration > 3 && !isTriggered) {
      let analyticParameter = {
        category: `${clickedIndex + 1}_single_video_play > 3s`,
        action: `${clickedIndex + 1}_single_video_play > 3s`,
        videoId: url[clickedIndex]._id,
      };
      fireAnalytics(analyticParameter);
      setIsTriggered(true);
    }
  };
  const onLoaded = (e: any) => {
    setTotalDuration(e.target.duration);
    setBufferStartTime(Date.now());
  };

  //function to go previous videos
  const handleBackwardClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    reportWatchTime();
    hardRestProgressBar();
    setVideoLoading(true);
    let analyticParameter = {
      category: "video_repeat",
      action: "video_repeat",
      videoId: url[clickedIndex]._id,
    };
    fireAnalytics(analyticParameter);
    if (clickedIndex !== 0) {
      setClickedIndex((p) => p - 1);
      !isPlaying && setIsPlaying(true);
    } else {
      closeFullScreen(e);
    }
    // User Changes to previous video in < 3 Seconds
    if (currentDuration < 3) {
      let analyticParameter = {
        category: `${clickedIndex + 1}_video_skip < 3s`,
        action: `${clickedIndex + 1}_video_skip < 3s`,
      };
      fireAnalytics(analyticParameter);
    }
  };
  //function to go next  videos
  const handleForwardClick = (e?: React.MouseEvent<HTMLElement>) => {
    e && e.stopPropagation();
    reportWatchTime();
    hardRestProgressBar();
    setVideoLoading(true);
    if (clickedIndex !== url.length - 1) {
      setIs25Percent(false);
      setIs50Percent(false);
      setIs75Percent(false);
      setIs100Percent(false);
      setIsTriggered(false);
      setClickedIndex((p) => p + 1);
      !isPlaying && setIsPlaying(true);
    } else {
      setClickedIndex(0);
    }

    // User Changes to next video in < 3 Seconds
    if (currentDuration < 3) {
      let analyticParameter = {
        category: `${clickedIndex + 1}_video_skip < 3s`,
        action: `${clickedIndex + 1}_video_skip < 3s`,
      };
      fireAnalytics(analyticParameter);
    }
  };
  const hardRestProgressBar = () => {
    setCurrentDuration(0);
    setTotalDuration(10);
  };
  //function for buy now functionalities

  const buyNow = () => {
    carousalState?.product?.store?.cta?.action !== "dismissed" &&
      toast.custom(
        <div className={Styles.toastContainer}>
          <img src={TickIcon} style={{ width: 20 }} />
          <div className={Styles.toastText}> Redirecting to cart</div>
        </div>,
        { duration: 2000 }
      );
    try {
      setIsBuyNowClick(true);
      let analyticParameter = {
        category: `${clickedIndex + 1}_video_buyNow_click`,
        action: `${clickedIndex + 1}_video-buyNow_click`,
        videoId: url[clickedIndex]?._id,
      };
      fireAnalytics(analyticParameter);

      if (carousalState.product.store?.cta.cta == "class") {
        let btnClass = carousalState.product.store?.cta.cssClass || "";
        let element: HTMLElement = document.getElementsByClassName(
          btnClass
        )[0] as HTMLElement;
        if (carousalState.product.store?.cta.action == "dismissed") {
          closeFullScreen();
          element.scrollIntoView({ block: "center", behavior: "smooth" });
        }
        element.click();
      } else {
        let btnClass = carousalState.product.store?.cta.cssClass || "";
        let element: HTMLElement = document.getElementById(
          btnClass
        ) as HTMLElement;
        if (carousalState.product.store?.cta.action == "dismissed") {
          closeFullScreen();
          element.scrollIntoView({ block: "center", behavior: "smooth" });
        }
        element.click();
      }
    } catch (e) {
      console.log("button class not found", e);
    }
  };
  const throttleBuyNow = useCallback(throttle(buyNow, 3000), [
    url,
    clickedIndex,
  ]);

  const onPlay = () => {
    let analyticParameter = {
      category: "video_play",
      action: "video_play",
      videoId: url[clickedIndex]._id,
    };
    fireAnalytics(analyticParameter);
    setVideoLoading(false);
  };

  const onPause = () => {
    let analyticParameter = {
      category: "video_pause",
      action: "video_pause",
      videoId: url[clickedIndex]._id,
    };
    fireAnalytics(analyticParameter);
    if (currentDuration > 3) {
      let analyticParameter = {
        category: "pause_after_3s",
        action: "pause_after_3s",
        videoId: url[clickedIndex]._id,
      };
      fireAnalytics(analyticParameter);
    }
  };

  const onwaiting = (e: any) => {
    setVideoLoading(true);
    setBufferStartTime(Date.now());
  };

  //Total time for the user view the videos
  useEffect(() => {
    let loadIntervalId: any;
    if (open && isPlaying) {
      loadIntervalId = setInterval(() => {
        setTotalPlayTime((prev: number) => (prev += 1));
      }, 1000);
      setLoadPlayTime(loadIntervalId);
    } else if (open && !isPlaying) {
      clearInterval(loadPlayTime);
    } else {
      clearInterval(loadPlayTime);
      if (totalPlayTime) {
        let analyticParameter = {
          category: "total_video_play_time",
          action: "total_video_play_time",
          value: totalPlayTime,
        };
        fireAnalytics(analyticParameter);
      }

      setTotalPlayTime(0);
    }
  }, [open, isPlaying]);

  const PlayPauseBtn = (center?: string) => {
    return videoLoading ? (
      <div
        className={Styles.pushStarters_FullScreenPlayIconContainer}
        style={{ alignItems: center ? "center" : undefined }}
      >
        <CircularProgress sx={{ color: "#6C6C6C" }} />
      </div>
    ) : (
      <div
        className={Styles.pushStarters_FullScreenPlayIconContainer}
        style={{ alignItems: center ? "center" : undefined }}
        onClick={togglePlay}
      >
        {isPlaying ? (
          <img
            className={Styles.pushStarters_FullScreenPlayIconContainerIcon}
            alt="pause"
            src={PauseIcon}
            style={{ opacity: isPlaying ? 0 : 1 }}
          />
        ) : (
          <img
            className={Styles.pushStarters_FullScreenPlayIconContainerIcon}
            alt="play"
            src={PlayIcon}
          />
        )}
      </div>
    );
  };

  // buy now CTA event listener
  function handleBuyNowCtaClick() {
    setTimeout(() => {
      if (!isBuyNowClick) {
        let analyticParameter = {
          category: "brand_buy_now",
          action: "brand_buy_now",
        };
        fireAnalytics(analyticParameter);
      }
      setIsBuyNowClick(false);
    }, 1000);
  }

  let buyNowBtnClass =
    carousalState?.product?.store?.buyNow_cta?.cssClass || "";

  let buy_nowElementArray: any =
    document.getElementsByClassName(buyNowBtnClass);
  let buyNowElement: HTMLElement | false =
    buy_nowElementArray.length > 0 &&
    (document.getElementsByClassName(buyNowBtnClass)[0] as HTMLElement);

  const throttleBuyNowCTA = useCallback(
    throttle(handleBuyNowCtaClick, 3000),
    []
  );

  if (buyNowElement) {
    buyNowElement.addEventListener("click", throttleBuyNowCTA);
  }

  // add to cart button event listener

  function handleAddToCartClick() {
    let analyticParameter = {
      category: "brand_add_to_cart",
      action: "brand_add_to_cart",
    };
    fireAnalytics(analyticParameter);
  }

  let addToCartBtnClass =
    carousalState?.product?.store?.addToCart_cta?.cssClass || "";

  let addToCartElemArray: any =
    document.getElementsByClassName(addToCartBtnClass);
  let addToCartElement: HTMLElement | false =
    addToCartElemArray.length > 0 &&
    (document.getElementsByClassName(addToCartBtnClass)[0] as HTMLElement);

  const throttleAddToCart = useCallback(
    throttle(handleAddToCartClick, 3000),
    []
  );
  if (addToCartElement) {
    addToCartElement.addEventListener("click", throttleAddToCart);
  }

  const handleNextClick = () => {
    if (divRef.current) {
      divRef.current.scrollLeft += scrollDistance;
    }
    if (isPrevButtonDisabled) {
      setIsPrevButtonDisabled(false);
    }
    if (
      divRef.current!.scrollLeft ===
      divRef.current!.scrollWidth - divRef.current!.clientWidth
    ) {
      setIsNextButtonDisabled(true);
    }

    let analyticParameter = {
      category: "feed_scrolled",
      action: "feed_scrolled",
    };
    fireAnalytics(analyticParameter);
  };

  const handlePrevClick = () => {
    if (
      divRef.current!.scrollLeft ===
      divRef.current!.scrollWidth - divRef.current!.clientWidth
    ) {
      divRef.current!.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      if (divRef.current) {
        divRef.current.scrollLeft -= scrollDistance;
      }
    }
    if (divRef.current!.scrollLeft === 0) {
      setIsPrevButtonDisabled(true);
    }

    if (isNextButtonDisabled) {
      setIsNextButtonDisabled(false);
    }
    let analyticParameter = {
      category: "feed_scrolled",
      action: "feed_scrolled",
    };
    fireAnalytics(analyticParameter);
  };
  const onPlaying = () => {
    if (bufferStartTime) {
      const bufferTime = Date.now() - bufferStartTime;
      setTotalBufferTime(
        (prevTotalBufferTime) => prevTotalBufferTime + bufferTime
      );
      setBufferStartTime(0);
    }
  };

  const onEnded = () => {
    reportWatchTime();
    handleForwardClick();
  };

  const reportWatchTime = () => {
    let totalWatchTime = totalPlayTime + totalBufferTime / 1000;
    fireAnalytics({
      action: "video_watch_and_time",
      category: "video_watch_and_time",
      videoId: url[clickedIndex]._id,
      value: totalWatchTime,
    });
    setTotalBufferTime(0);
  };

  function handleMouseEnter(
    index: number,
    event: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) {
    const imageElement = event.currentTarget;
    const fullyInViewport = isFullyInViewport(imageElement);

    if (fullyInViewport) {
      setIsHoveredIndex(index);
    }
  }
  const displayVideoComponent = (u: Media, i: number) => {
    return u.downloadUrl && isHoveredIndex === i ? true : false;
  };

  useEffect(() => {
    let p = new URL(window.location.href).searchParams.get("media_id");
    let analyticParameter = {
      category: "pdp/video/autoload",
      action: "pdp/video/autoload",
      value: {
        enabled: p ? true : false,
      },
    };
    fireAnalytics(analyticParameter);
    if (p) {
      //find video with index in url
      let vIndex = carousalState?.product.media?.findIndex((m: Media) => {
        return m._id === p;
      });
      if (vIndex !== -1) {
        //if video found then set it to hovered index
        handelClick(vIndex!, true);
      }
    }
    // remove media_id from url
    let url = new URL(window.location.href);
    url.searchParams.delete("media_id");
    window.history.pushState({}, document.title, url.toString());
  }, []);

  const handleShareUrl = async (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
    u: Media
  ) => {
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.search = "";
    const updatedUrl = url.toString();
    let urlToShare = `${updatedUrl}?media_id=${u?._id}`;
    if (navigator.share) {
      await navigator.share({
        text: "Carousal single video shared url",
        url: urlToShare,
        title: u?.title,
      });
    } else {
      await navigator.clipboard.writeText(urlToShare);
      toast.custom(
        <div className={Styles.toastContainer}>
          <img src={TickIcon} style={{ width: 20 }} />
          <div className={Styles.toastText}> Copied to clipboard</div>
        </div>,
        { duration: 2000 }
      );
    }
  };

  useEffect(() => {

    let analyticParameter = {
      category: "pdp/video/autoload",
      action: "pdp/video/autoload",
      value: {
        enabled: carousalState.product.store?.showOverlay ? true : false,
      },
    };
    fireAnalytics(analyticParameter);
    if (carousalState.product.store?.showOverlay && !isOverLayOpened) {
      handelClick(0, true);
      setIsOverLayOpened(true);
    }

    return () => {
      setOpen(false);
      setIsOverLayOpened(false);
    };
  }, []);

  useEffect(() => {
    if (adBlockDetected) {
      fireAnalytics({
        action: "ad_block_enable",
        category: "ad_block_enable",
      });
    }
  }, [adBlockDetected]);

  return carousalState?.status !== "loading" ? (
    <>
      {open && (
        <Dialog
          open={open}
          fullScreen
          disableRestoreFocus
          sx={{ zIndex: 9999 }}
          PaperProps={{ style: { backgroundColor: "rgba(0,0,0,0.8)" } }}
        >
          <div
            className={Styles.pushStarters_FullScreenContainer}
            style={{ width, height }}
          >
            <div className={Styles.pushStarters_FullScreenForwardBackward}>
              {width >= 768 ? (
                <>
                  <div
                    className={Styles.pushStarters_FullScreenDesktopBackward}
                    data-testid="backward"
                    onClick={handleBackwardClick}
                  >
                    <img
                      className={
                        Styles.pushStarters_FullScreenPlayNavForwardIconContainerIcon
                      }
                      src={LeftNavigationIcon}
                    />
                  </div>
                  {PlayPauseBtn("center")}
                  <div
                    className={Styles.pushStarters_FullScreenDesktopForward}
                    data-testid="forward"
                    onClick={handleForwardClick}
                  >
                    <img
                      className={
                        Styles.pushStarters_FullScreenPlayNavBackwardIconContainerIcon
                      }
                      src={RightNavigationIcon}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{ fontSize: 0 }}
                    data-testid="backward"
                    onClick={handleBackwardClick}
                  >
                    handleBackwardClick
                  </div>
                  {PlayPauseBtn()}
                  <div
                    style={{ fontSize: 0 }}
                    data-testid="forward"
                    onClick={handleForwardClick}
                  >
                    handleForwardClick
                  </div>
                </>
              )}
            </div>
            <ProgressBar
              totalDuration={totalDuration}
              currentDuration={currentDuration}
              numberOfVideos={url.length}
              currentIndex={clickedIndex}
              title={url[clickedIndex]?.title}
              vidWidth={vidTempRef.current?.offsetWidth!}
              isMuted={isMuted}
              handelMuteClick={handelMuteClick}
              closeFullScreen={closeFullScreen}
            />
            <video
              ref={vidRef}
              data-testid="player"
              height="100%"
              width={width > 500 ? 500 : undefined}
              src={url[clickedIndex]?.downloadUrl}
              muted={isMuted}
              onTimeUpdate={onProgress}
              onLoadedMetadataCapture={onLoaded}
              className={Styles.pushStarters_Video}
              playsInline
              autoPlay
              onEnded={onEnded}
              onPlay={onPlay}
              onPause={onPause}
              onWaiting={onwaiting}
              onPlaying={onPlaying}
            />
            {vidTempRef.current?.offsetWidth! && (
              <div
                className={Styles.pushStarters_BuyNowBtnContainer}
                style={{
                  width: vidTempRef.current?.offsetWidth!
                    ? vidTempRef.current?.offsetWidth! * 0.95
                    : width * 0.5,
                  borderRadius: `${carousalState.product.store?.cta.borderRadius}px`,
                }}
              >
                <div
                className={Styles.pushStarters_productMainContainer}
                >
                  <Avatar
                    src={carousalState?.product?.store?.logo.downloadUrl}
                    alt="client_logo"
                    className={Styles.pushStarters_clientLogo}
                  />
                  <div className={Styles.pushStarters_productDetailsContainer}>
                    <h4 className={Styles.pushStarters_productTitle}>
                      {carousalState?.product?.title}
                    </h4>
                    <h4 className={Styles.pushStarters_productPrice}>
                      ₹ {`${carousalState?.product?.price}`}
                    </h4>
                  </div>
                </div>
                <Button
                  className={Styles.pushStarters_BuyNowBtn}
                  data-testid="buyNow-btn"
                  variant="contained"
                  onClick={throttleBuyNow}
                  sx={{
                    width: vidTempRef.current?.offsetWidth!
                      ? vidTempRef.current?.offsetWidth! * 0.9
                      : width * 0.5,
                    backgroundColor:
                      carousalState.product.store?.cta.background,
                    fontSize: carousalState.product.store?.cta.fontSize,
                    color: carousalState.product.store?.cta.color,
                    borderRadius: `${carousalState.product.store?.cta.borderRadius}px`,
                    "&:hover": {
                      backgroundColor:
                        carousalState.product.store?.cta.background,
                    },
                  }}
                >
                  {carousalState.product.store?.cta.title}
                </Button>
              </div>
            )}
          </div>
        </Dialog>
      )}
      <div className={Styles.pushStarters_CarousalMainContainer}>
        {url.length >= 4 && (
          <button
            disabled={isPrevButtonDisabled}
            onClick={handlePrevClick}
            className={Styles.pushStarters_Scroller_Button}
          >
            <NavigateBeforeOutlinedIcon
              className={Styles.pushStarters_Prev_Button}
              sx={{
                backgroundColor:
                  carousalState.product.store?.navigation_props?.background,
                color: carousalState.product.store?.navigation_props?.iconColor,
              }}
            />
          </button>
        )}
        <div
          className={Styles.pushStarters_CarousalContainer}
          onScroll={handleScrollDebounced}
          ref={divRef}
        >
          {url.map((u: Media, i) => (
            <div
              className={Styles.pushStarters_VideoContainer}
              onClick={() => handelClick(i)}
              key={i}
            >
              {width > 480 ? (
                <>
                  <video
                    autoPlay
                    muted
                    controls={false}
                    playsInline
                    src={u?.gif?.downloadUrl}
                    loop
                    className={Styles.pushStarters_Thumbnail}
                    style={{
                      zIndex: displayVideoComponent(u, i) ? 2 : 1,
                      display: displayVideoComponent(u, i) ? "block" : "none",
                    }}
                    onMouseLeave={() => setIsHoveredIndex(null)}
                  />
                  <img
                    src={u?.thumbnailUrl}
                    onMouseEnter={(event) => handleMouseEnter(i, event)}
                    style={{ zIndex: isHoveredIndex === i ? 1 : 2 }}
                    className={Styles.pushStarters_Thumbnail}
                  />
                </>
              ) : (
                <>
                  <video
                    src={u?.gif?.downloadUrl}
                    muted
                    playsInline
                    controls={false}
                    className={Styles.pushStarters_Thumbnail}
                    style={{
                      zIndex: isFullyInViewport(thumbnailRef.current[i].current)
                        ? 2
                        : 1,
                    }}
                    ref={thumbnailRef.current[i]}
                    autoPlay
                    loop
                  />
                  <img
                    src={u?.thumbnailUrl}
                    className={Styles.pushStarters_Thumbnail}
                    ref={thumbnailRef.current[i]}
                    style={{
                      zIndex: !isFullyInViewport(
                        thumbnailRef.current[i].current
                      )
                        ? 2
                        : 1,
                    }}
                  />
                </>
              )}
              <h4
                className={Styles.pushStarters_ThumbnailTitle}
                style={{
                  fontFamily:
                    carousalState.product.store?.title_props?.fontFamily ??
                    "Montserrat",
                  fontSize: carousalState.product.store?.title_props?.fontSize
                    ? `${carousalState.product.store?.title_props?.fontSize}px`
                    : "18px",
                  fontWeight:
                    carousalState.product.store?.title_props?.fontWeight ?? 600,
                  color:
                    carousalState.product.store?.title_props?.color ?? "#fff",
                  zIndex: 2,
                }}
              >
                {u.title}
              </h4>
              <Share
                className={Styles.pushStarters_VideoShareBtn}
                onClick={(e) => handleShareUrl(e, u)}
              />
              <img
                src={PlayIcon}
                className={Styles.pushStarters_ThumbnailPlayPauseBtn}
              />
            </div>
          ))}
        </div>

        {url.length >= 4 && (
          <button
            disabled={isNextButtonDisabled}
            onClick={handleNextClick}
            className={Styles.pushStarters_Scroller_Button}
          >
            <NavigateNextOutlinedIcon
              className={Styles.pushStarters_Next_Button}
              sx={{
                backgroundColor:
                  carousalState.product.store?.navigation_props?.background,
                color: carousalState.product.store?.navigation_props?.iconColor,
              }}
            />
          </button>
        )}
      </div>
      <Toaster />
      <img src={TickIcon} style={{ display: "none" }} />
      <video
        ref={vidTempRef}
        height={window.innerHeight}
        src={url[0]?.downloadUrl}
        muted
        className={Styles.pushStarters_VideoDummy}
        width={width > 500 ? 500 : undefined}
      />
    </>
  ) : (
    <p>...Loading</p>
  );
};
export default Carousel;
