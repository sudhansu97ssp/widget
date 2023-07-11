import {
  screen,
  waitForElementToBeRemoved,
  waitFor,
  cleanup,
} from "@testing-library/react";
import fireEvent from "@testing-library/user-event";
import React from "react";
import Carousal from "./";
import { renderWithProviders } from "../../utils/test-utils";
import { act } from "react-dom/test-utils";

const initialRender = async () => {
  renderWithProviders(<Carousal />);
  await waitForElementToBeRemoved(() => screen.getByText(/...Loading/));
  await new Promise((res) => setTimeout(res, 500));
};

const fullScreenRender = async () => {
  await initialRender();
  let btn = await screen.findAllByAltText("play_btn");

  await act(async () => fireEvent.click(btn[0]));
  await waitFor(() => expect(screen.getByTestId("player")).toBeInTheDocument());
  await new Promise((res) => setTimeout(res, 500));
};

describe("Carousal", () => {
  test("Initial Loading", () => {
    renderWithProviders(<Carousal />);
    let element = screen.getByText(/...Loading/);
    expect(element).toBeInTheDocument();
    cleanup();
  });
  test("Play Btn on Carousal item", async () => {
    await initialRender();
    let btn = screen.findAllByAltText("play_btn");
    (await btn).forEach((b) => {
      expect(b).toBeInTheDocument();
      expect(b).toBeVisible();
    });
    cleanup();
  });
  test("Click on the play btn", async () => {
    await initialRender();
    let btn = await screen.findAllByAltText("play_btn");
    await act(async () => fireEvent.click(btn[0]));
    cleanup();
  });

  test("Full screen video player render", async () => {
    await initialRender();
    let btn = await screen.findAllByAltText("play_btn");
    // simulate button click
    await act(async () => fireEvent.click(btn[0]));

    // expect result
    await waitFor(() =>
      expect(screen.getByTestId("player")).toBeInTheDocument()
    );
    cleanup();
  });

  test("Fullscreen root element render", async () => {
    await fullScreenRender();
    let buyBtn = await screen.findByTestId("buyNow-btn");
    let forward = await screen.findByTestId("forward");
    let backward = await screen.findByTestId("backward");
    let pause = await screen.findByAltText("pause");
    let muteButton = await screen.findByAltText("mute-btn");
    let closeBtn = await screen.findByAltText("close-btn");
    expect(buyBtn).toBeInTheDocument();
    expect(buyBtn).toBeVisible();
    expect(muteButton).toBeInTheDocument();
    expect(muteButton).toBeVisible();
    expect(pause).toBeInTheDocument();
    expect(pause).not.toBeVisible();
    expect(forward).toBeInTheDocument();
    expect(forward).toBeVisible();
    expect(backward).toBeInTheDocument();
    expect(backward).toBeVisible();
    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn).toBeVisible();
    cleanup();
  });

  test("Click on the button", async () => {
    await fullScreenRender();
    let closeBtn = await screen.findByAltText("close-btn");
    let buyBtn = await screen.findByTestId("buyNow-btn");
    let muteButton = await screen.findByAltText("mute-btn");
    let pause = await screen.findByAltText("pause");
    await act(async () => fireEvent.click(muteButton));
    await act(async () => fireEvent.click(pause));
    await act(async () => fireEvent.click(buyBtn));
    let unMuteButton = await screen.findByAltText("unmute-btn");
    await act(async () => fireEvent.click(unMuteButton));
    await act(async () => fireEvent.click(closeBtn));
    cleanup();
  });
  test("Full-screen play button render", async () => {
    await fullScreenRender();
    let pause = await screen.findByAltText("pause");
    await act(async () => fireEvent.click(pause));
    let play = await screen.findByAltText("play");
    expect(play).toBeInTheDocument();
    expect(play).toBeVisible();
    await act(async () => fireEvent.click(play));
    cleanup();
  });
});
