import { bootstrapCameraKit, Injectable, remoteApiServicesFactory } from "@snap/camera-kit"
import { Settings } from "./settings"

//Credits to @bastiensaro (https://www.filtre-experience.fr/) for the code below
const lensRemoteAPIHandler = {
  apiSpecId: Settings.config.remoteAPISpecId, //spec ID needs to be the same as the spec ID from Mylenses API

  //Below is the code that will run once any remote API request with the specs ID above is detected from the lens
  getRequestHandler(request) {
    if (request.endpointId !== "button_pressed") return //change to your EndPoint or Reference ID from Mylenses
    console.log("REMOTE API :" + request.parameters.yourParameter)
    //parameter can be used to differentiate between different buttons or events from your lens
    //you can setup your own parameter in Mylenses API, below are just example
    if (request.parameters.button_id === "12345") {
      //run code for button 1
      console.log("button 12345 is pressed")
    } else if (request.parameters.button_id === "67890") {
      //run code for button 2
    }

    //gives a reply to the lens request, you can use it to check that the webapp has received the request
    return async (reply) => {
      reply({
        status: "success",
        metadata: {},
        body: new TextEncoder().encode(request.parameters.yourParameter + " responded"),
      })
    }
  },
}

// use this boostrapCameraKit function to inform the lens to run the code you setup above whenever there is any remote API requested
export const bootstrapCameraKitWithRemoteAPI = async (apiToken) => {
  return await bootstrapCameraKit(
    {
      apiToken: Settings.config.apiToken,
      logger: "console",
    },
    (container) => {
      return container.provides(
        Injectable(remoteApiServicesFactory.token, [remoteApiServicesFactory.token], (existing) => [...existing, lensRemoteAPIHandler])
      )
    }
  )
}
