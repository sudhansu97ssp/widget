import * as React from "react";
import { LinearProgress } from "@mui/material";
import * as Styles from "./ProgressBar.module.css";
import Mute from "../../assets/Mute.svg";
import Unmute from "../../assets/Unmute.svg";
import Close from "../../assets/Close.svg";

export default function LinearWithValueLabel({
  totalDuration,
  currentDuration,
  numberOfVideos,
  currentIndex,
  title,
  vidWidth,
  isMuted,
  handelMuteClick,
  closeFullScreen,
}: {
  totalDuration: number;
  currentDuration: number;
  numberOfVideos: number;
  currentIndex: number;
  title: string | undefined;
  vidWidth: number;
  isMuted: boolean;
  handelMuteClick: any;
  closeFullScreen: any;
}) {
  return (
    <>
      {vidWidth && (
        <div
          className={Styles.pushStarters_TopProgressBar}
          style={{ width: vidWidth * 0.95 }}
        >
          <div className={Styles.pushStarters_TopProgressBarContainer}>
            {[...Array(numberOfVideos)].map((_, i) => (
              <LinearProgress
                key={i}
                variant="determinate"
                value={
                  currentIndex > i
                    ? 100
                    : currentIndex === i
                    ? (currentDuration / totalDuration) * 100
                    : 0
                }
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  borderRadius: 5,
                  height: 4,
                  width: `${90 / numberOfVideos}vw`,
                  marginRight: 1,
                  "& .MuiLinearProgress-bar1Determinate": {
                    backgroundColor: "white",
                  },
                  "&.MuiLinearProgress-bar": {
                    transition: "none",
                  },
                }}
              />
            ))}
          </div>
          <div className={Styles.pushStarters_VideoTitleContainer}>
            <h2 className={Styles.pushStarters_VideoTitle}>{title}</h2>
            <div className={Styles.pushStarters_FullScreenTopIconContainer}>
              {!isMuted ? (
                <img
                  src={Mute}
                  alt="unmute-btn"
                  className={Styles.pushStarters_MuteUnMuteBtn}
                  onClick={handelMuteClick}
                />
              ) : (
                <img
                  src={Unmute}
                  alt="mute-btn"
                  className={Styles.pushStarters_MuteUnMuteBtn}
                  onClick={handelMuteClick}
                />
              )}
              <img
                src={Close}
                alt="close-btn"
                className={Styles.pushStarters_MuteUnMuteBtn}
                onClick={closeFullScreen}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
