/*You can pass parameters of type:
Strings
Arrays of Strings
Numbers
Arrays of Numbers */
export const launchParams = { launchParams: { testParam: "text from web app" } }

/*In Lens Studio, you can use the following typescript code to obtain the data when Lens launch.
You can change the testParam name but make sure to use the same in the Lens Studio code
You can also add more data to send to lens as long as it is lesser than or equal to 3kb

@component
export class LaunchParams extends BaseScriptComponent {
  @input debugText: Text

  public launchDataStore: any = null
  onAwake() {
    this.launchDataStore = global.launchParams
    this.debugText.text = this.launchDataStore.getString("testParam") || "no launch data"
  }
}
*/
