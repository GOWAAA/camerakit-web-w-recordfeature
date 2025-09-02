/*You can pass parameters of type:
Strings
Arrays of Strings
Numbers
Arrays of Numbers */
export const launchParams = { launchParams: { testParam: "text from web app" } }

/*
In Lens Studio, you can use the following typescript code to obtain the data when Lens launch.
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

Although mutiple types of data are supported, only string type seems to be working (or at least I haven't figure out how to use other type).
So I recommend using string to pass all your data to the lens instead. 

For example, on camera kit's side: 
let myNumber = 10
let myData = [10, 20, 40]
export const launchParams = { launchParams: { testNum: myNumber.toString(), testData: JSON.stringify(myData) } }

On Lens Studio's side:
this.launchDataStore = global.launchParams
this.myNum = parse.int(this.launchDataStore.getString("testNum"))
this.myData = JSON.parse(this.launchDataStore.getString("testData"))
*/
