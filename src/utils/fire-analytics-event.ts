import mixpanel from "mixpanel-browser";
import ReactGA from "react-ga4";

const fireAnalytics = async ({
  category,
  action,
  videoId,
  value,
}: {
  category: string;
  action: string;
  videoId?: string;
  value?: number | false | object;
}) => {
  let parameter: {
    videoId?: string;
    productId: string;
    value?: number;
    action: string;
  } = {
    productId: document
      .getElementById("app")
      ?.getAttribute("data-productId") as string,
    action,
  };

  parameter = Object.assign(
    parameter,
    value && { value },
    videoId && { videoId },
  );

  ReactGA.event(category, parameter);
  try {
    mixpanel.track(category, parameter);
  } catch (e) {
    console.log("Mixpanel is not initialized", e);

    let failCategory = `failure ${category}`;
    parameter.action = `failure ${parameter.action}`;
    ReactGA.event(failCategory, parameter);
  }
};

export default fireAnalytics;
