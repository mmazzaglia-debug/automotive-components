import { LightningElement,api,track,wire } from 'lwc';
import { getRecord, getRecordNotifyChange } from "lightning/uiRecordApi";
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from "lightning/empApi";
import getActiveProgram from "@salesforce/apex/cxInCustomGuidanceCenterCls.getActiveProgram";
import getAllPrograms from "@salesforce/apex/cxInCustomGuidanceCenterCls.getAllPrograms";
import getSections from "@salesforce/apex/cxInCustomGuidanceCenterCls.getSections"
import activatePartnerProgram from "@salesforce/apex/cxInCustomGuidanceCenterCls.activatePartnerProgram";
import setExerciseAsComplete from "@salesforce/apex/cxInCustomGuidanceCenterCls.setExerciseAsComplete";
import resetProgress from "@salesforce/apex/cxInCustomGuidanceCenterCls.resetProgress";
export default class CxInPartnerOBE extends LightningElement {
  progId;
  @track progOutcomeList;
  @track allSectionsList;
  @track program;
  @track allPrograms = [];
  // @track isModalOpen = false;
  isLoading = true;
  videoEmbedURL;
  @track lesson=[];
  @track lessonName;
  @track lessonDescription;
  @track lessonRichText;
  @track lessonLength;
  @track videoName;
  @track videoDescription;
  @track videoLength;
  @track video=[];
  isOpen = false;
  isExpanded = false;
  isShowAllPrograms = false;
  isShowLessonDetails = false;
  isLessonContent = false;
  isVideoContent = false;

    // Feedback
    isShowFeedbackDetails = false;
    isShowFeedbackResults = false;
    @track feedback = [];
    @track feedbackTitle1;
    @track feedbackTitle2;
    @track feedbackTitle3;
    @track feedbackDescription1;
    @track feedbackDescription2;
    @track feedbackDescription3;
    @track feedbackRating1;
    @track feedbackRating2;
     feedbackTotalAvgScore=0;
    @track feedbackDueDate;
    @track feedbackCompletedDate;
    @track feedbackDuration;
    @track feedbackassessmentURL;
    @track feedbackHeader;
    @track feedbackSubHeader;

  @track milestoneCheck;
  @track allSections;
  @track programOutcome = [];
  //hidden feature vars
  clickTimer;
  clickTimerDelay = 200;
  clickPrevent = false;
  sectionsExpanded = true;
  @api outcomeType;
  @track milestoneOutcomeType;
  @track exerciseId;
   isItemComplete = false;

     //User Lookup
  @track selectedRecords = [];
  
  selectedRecordsLength=false;
  @track selectedUserNames=[];

  //CDC Config
  channelName = "/data/CGC_Milestone_and_Exercise__ChangeEvent";
  subscription = {};
  responseMessage;
  isDisplayMsg;

    // current date
    date = new Date(Date.now()).toLocaleString().split(',')[0];

  connectedCallback() {
    //get program records
    this.getAllData();

    //CDC Init
    this.handleSubscribe();
    this.registerErrorListener();

    //Tampermonkey Events
    // document.addEventListener("deRYGuidanceCenterEvent", this.receiveMessage);
    // document.dispatchEvent(
    //   new CustomEvent("deRYIsCustomGuidanceCenterAvailable", {
    //     bubbles: true
    //   })
    // );
    // if (localStorage.getItem("isCustomGuidanceCenterOpenLWC") === "true") {
    //   try {
    //     this.isOpen = true;
    //     document.dispatchEvent(
    //       new CustomEvent("deRYHighlightTrailheadIcon", {
    //         detail: true,
    //         bubbles: true
    //       })
    //     );
    //     //console.log(">>> highlighting trailhead from LWC");
    //   } catch (err) {
    //     console.log("err : ", err);
    //   }
    // }
  }

  disconnectedCallback() {
    document.removeEventListener("deRYGuidanceCenterEvent", this.receiveMessage);
    this.handleUnsubscribe();
  }

  /******************** 
    CDC Methods Start 
    ********************/
  handleSubscribe() {
    const messageCallback = (response) => {
      this.handleNotification(response);
    };

    subscribe(this.channelName, -1, messageCallback).then((response) => {
      if (this.subscription) {
        this.handleUnsubscribe();
      }
      this.subscription = response;
      this.handleNotification(response);
    });
  }

  handleUnsubscribe() {
    unsubscribe(this.subscription, (response) => {
      console.log("unsubscribe() response: ", JSON.stringify(response));
    });
  }

  registerErrorListener() {
    onError((error) => {
      console.log("Received error from server: ", JSON.stringify(error));
    });
  }

  handleNotification(response) {
    if (response.hasOwnProperty("data")) {
      this.getAllData();
    }
  }
  /******************** 
    CDC Methods End 
    ********************/

    /******************** 
  get program and section data Start
  ********************/

  getAllData() {
    console.log("Indide getalldata");
    getAllPrograms({ activeForPartner: true })
      .then((result) => {
        try {
          this.allPrograms = result;
          this.error = undefined;
        } catch (error) {
          console.error('getAllData >>> ', getActiveProgram);
        }
      })
      .catch((error) => {
        console.log(">>> CGC program apex error getAllPrograms", error);
        this.error = error;
        this.allPrograms = undefined;
      })
      .finally(() => {
        this.isLoading = false;
      });
    this.callGetProgram();
  }

  selectProgram(evt) {
    this.isLoading = true;
    activatePartnerProgram({
      recordId: evt.currentTarget.dataset.programid
    })
      .then((result) => {
        this.callGetProgram();
        this.error = undefined;
      })
      .catch((error) => {
        console.log(">>> CGC program apex error selectProgram", error);
        this.error = error;
      });
  }

  callGetProgram() {
    getActiveProgram({ activeForPartner: true })
      .then((result) => {
        try {
          if(result.length) {
            this.program = result;
            this.error = undefined;
            //console.log("Active programs", this.program);
            this.progId = this.program[0].Id;

            if(this.program[0].Milestone_Icon_Type__c === "Icon") {
              this.milestoneOutcomeType = true;
            } else {
              this.milestoneOutcomeType = false;
            }

            console.log("mile type", this.program[0].Milestone_Icon_Type__c);
            console.log("mile type val", this.milestoneOutcomeType);

            this.callGetSections();
            if (this.isShowAllPrograms) {
              this.isShowAllPrograms = false;
            }
          } else {
            this.isShowAllPrograms = true;
          }
        } catch (error) {
          console.error('getActiveProgram >>> ', getActiveProgram);
        }
      })
      .catch((error) => {
        console.log(">>> CGC program apex error getProgram", error);
        if (error.body.message === "List has no rows for assignment to SObject") {
          this.isShowAllPrograms = true;
        }
        this.error = error;
        this.program = undefined;
      })
      .finally(() => {
        this.isLoading = false;
      });

  }
  callGetSections() {
    getSections({ progId: this.progId })
      .then((result) => {
        try {
          this.allSections = result;
          this.error = undefined;
          // console.log(">>>>All Sections", this.allSections);
          this.progOutcomeList = this.allSections.progOutcomeList;
          this.allSectionsList = this.allSections.seclist;
          console.log("Sections List",this.allSectionsList);
          console.log("Program Outcome List",this.progOutcomeList);
         for(let i=0;i<this.allSectionsList.length;i++){
           for(let j=0;j<this.allSectionsList[i].Milestones_and_Exercises__r.length;j++){
             if(this.allSectionsList[i].Milestones_and_Exercises__r[j].Type__c==="Lesson"){
              this.lesson.push(this.allSectionsList[i].Milestones_and_Exercises__r[j]);
             }
               else if(this.allSectionsList[i].Milestones_and_Exercises__r[j].Type__c==="Video"){
               this.video.push(this.allSectionsList[i].Milestones_and_Exercises__r[j]);
             }
             else if(this.allSectionsList[i].Milestones_and_Exercises__r[j].Type__c==="Feedback Request"){
              this.feedback.push(this.allSectionsList[i].Milestones_and_Exercises__r[j]);
        
             
           }           
             }
           }
         }
        catch (error) {
          console.log("Get Sections Error", error);
        }
      })
      .catch((error) => {
        console.log(">>> CGC program apex error getAllPrograms", error);
        this.error = error;
        this.allSections = undefined;
      })
      .finally(() => {
        this.isLoading = false;
      });

  }

    /******************** 
  get program and section data End
  ********************/

  // handle click on exercise types Lesson, Video and Feedback. Also adds the completed icon.
  handleExerciseClick(evt) {
    let { recid, type, url, iscomplete } = evt.currentTarget.dataset;   

    if (!url && type !== "Lesson" && type!=="Feedback Request") {
      return;
    }
    if (type == "Video" || type == "Lesson" || type == "Feedback Request") {
      this.isShowLessonDetails = true;
      this.isVideoContent = false;
      this.isExpanded = true;
      this.isShowFeedbackDetails = false;
      this.isShowFeedbackResults = false;
      if (type == "Lesson") {
        this.isLessonContent = true;
        for (let i = 0; i < this.lesson.length; i++) {
          if (recid === this.lesson[i].Id) {
            this.lessonName = this.lesson[i].Name__c;

            this.lessonDescription = this.lesson[i].Description__c;
            this.lessonRichText = this.lesson[i].Lesson_Description__c;
            this.lessonLength = this.lesson[i].Exercise_Duration__c;
            this.exerciseId = recid;
            if (iscomplete === "true") {
              this.isItemComplete = true;
            } else {
              this.isItemComplete = false;
            }
            
          }

        }

      } else if (type == "Video") {
        this.isLessonContent = false;
        this.isVideoContent = true;
        this.isShowFeedbackDetails = false;
        this.isShowFeedbackResults = false;
         for (let i = 0; i < this.video.length; i++) {
          if (recid === this.video[i].Id) {
            this.videoName = this.video[i].Name__c;
            console.log("Video Name",this.videoName);
            this.videoDescription = this.video[i].Description__c;
            this.videoLength = this.video[i].Exercise_Duration__c;
            console.log("Video Description",this.videoDescription);
            this.exerciseId = recid;
            if (iscomplete === "true") {
              this.isItemComplete = true;
            } else {
              this.isItemComplete = false;
            }
          }

        }
        if (url.includes("youtube")) {
          this.videoEmbedURL = `https://www.youtube.com/embed/${this.parser_youtube(url)}`;
        } else if (url.includes("vidyard")) {
          this.videoEmbedURL = `https://play.vidyard.com/${this.parser_vidyard(
            url
          )}.html?autoplay=0&amp;custom_id=&amp;embed_button=0&amp;viral_sharing=0&amp;`;
        }
      }
      else if (type == "Feedback Request") {
        this.selectedUserNames = [];
        this.isShowFeedbackDetails = true;
        this.isShowFeedbackResults = false;
        this.isVideoContent = false;
        this.isLessonContent = false;
        for (let i = 0; i < this.feedback.length; i++) {
          if (recid === this.feedback[i].Id) {
            this.feedbackTitle1 = this.feedback[i].Feedback_Title1__c;
            this.feedbackTitle2 = this.feedback[i].Feedback_Title2__c;
            this.feedbackTitle3 = this.feedback[i].Feedback_Title3__c;
            this.feedbackDescription1 = this.feedback[i].Feedback_Description1__c;
            this.feedbackDescription2 = this.feedback[i].Feedback_Description2__c;
            this.feedbackDescription3 = this.feedback[i].Feedback_Description3__c;
            this.feedbackRating1 = this.feedback[i].Feedback_Rating1__c;
            this.feedbackRating2 = this.feedback[i].Feedback_Rating2__c;
            this.feedbackRating3 = this.feedback[i].Feedback_Rating3__c;
            this.feedbackDueDate=this.feedback[i].Due_Date__c;
            this.feedbackCompletedDate=this.feedback[i].Completed__c;
            this.feedbackDuration=this.feedback[i].	Exercise_Duration__c;
            this.feedbackassessmentURL=this.feedback[i].URL_for_Self_Assessment__c;
            this.feedbackHeader=this.feedback[i].Name__c;
            this.feedbackSubHeader=this.feedback[i].Description__c;
            this.feedbackRating1 = this.feedbackRating1 || 0;
            this.feedbackRating2 = this.feedbackRating2 || 0;
            this.feedbackRating3 = this.feedbackRating3 || 0;
            this.feedbackTotalAvgScore=((this.feedbackRating1+this.feedbackRating2+this.feedbackRating3)/3).toFixed(2);
          }
        }
      } 
    } else {
      window.open(url, "_blank");
    }

    if (type !== "Video" && type !== "Lesson" && iscomplete !== "true") {
      try {
        evt.currentTarget
          .closest(".thp-item-card__container")
          .querySelector("c-cx-in-custom-guidance-center-icon")
          .markComplete();

        setExerciseAsComplete({ recordId: recid })
          .then((result) => {
            this.getAllData();
          })
          .catch((error) => {
            console.log(">>> update apex error", error);
          });
      } catch (error) {
        console.log("err,", error);
      }
    }
  }

  handleRequestFeedback() {
    this.isShowFeedbackDetails = false;
    this.isShowFeedbackResults = true;
    this.selectedRecordsLength = false;
  }

  markItemComplete(evt){
    let recid = evt.currentTarget.dataset.recid;
    let isItemComplete  = evt.currentTarget.dataset.isitemcomplete;
    let that = evt.currentTarget.dataset;

    if (isItemComplete !== "true") {
      try {
        setExerciseAsComplete({ recordId: recid })
          .then((result) => {
            that.isitemcomplete = "true";
            this.isItemComplete = true;
            this.doSingleClick();
            this.getAllData();
          
          })
          .catch((error) => {
            console.log(">>> update apex error", error);
          });
      } catch (error) {
        console.log("err,", error);
      }
    }
  }

  showAllPrograms() {
    this.isShowAllPrograms = true;
    this.isShowLessonDetails = false;
    this.isExpanded = false;
  }

    //Share Content For Review
    handleInputChange(event){
      this.textValueUrl = event.detail.value;
    }
    handleInputChangeForNote(event){
      this.textValueNote = event.detail.value;
    }
  
    //loookup to users
      handleselectedUserRecords(event) {
          this.selectedRecords = [...event.detail.selRecords]
          for(let i=0;i<this.selectedRecords.length;i++){
            if(!this.selectedUserNames.includes(this.selectedRecords[i].Name)){
               this.selectedUserNames.push(this.selectedRecords[i].Name);
            }
          }
          if(this.selectedRecords.length==5)
          this.selectedRecordsLength=true;
      }

  doSingleClick() {
    this.clickTimer = setTimeout(() => {
      if (!this.clickPrevent && this.isShowLessonDetails === true) {
        this.isShowLessonDetails = false;
        this.isExpanded = false;
      } else if (!this.clickPrevent) {
        this.isShowAllPrograms = true;
      }
      this.clickPrevent = false;
    }, this.clickTimerDelay);
  }

  // reset progress on double click
  doReset() {
    console.log("Inside doRest", this.progId);
    clearTimeout(this.clickTimer);

    this.clickPrevent = true;
    this.isLoading = true;
    resetProgress({
      programId: this.progId
    })
      .then((result) => {
        this.getAllData();
      })
      .catch((error) => {
        console.log(">>> reset apex error", error);
      });
  }

  goToApp() {
    let url = `https://${location.host}/lightning/app/c__Guidance_Center_Demo_Manager`;
    window.open(url, "_blank");
  }

  parser_youtube(url) {
    let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    let match = url.match(regExp);
    return match && match[7].length == 11 ? match[7] : false;
  }

  parser_vidyard(url) {
    let regExp = /^https:\/\/[a-zA-Z]+\.vidyard.com\/watch\/([a-zA-Z0-9]+)\??$/i;
    let match = url.match(regExp);
    return match[1];
  }

  // expands individual sections
  handleToggleClick(evt) {
    let curId = evt.currentTarget.dataset.id;
    console.log("curId>>>>>" + curId);
    this.template.querySelector("[data-toggle=" + curId + "]").classList.toggle("is-open");
  }

   // expands ratings breakdown section
   handleToggleRatingsBreakdown(evt) {
    evt.currentTarget.classList.toggle("is-open");
  }

  // handle expand all button in program details 
  toggleExpand(e) {
    if (this.sectionsExpanded) {
      this.template.querySelectorAll(".section-header").forEach((element) => {
        element.classList.remove("is-open");
      });
      this.sectionsExpanded = false;
      e.target.label = "Expand All";
    } else {
      this.template.querySelectorAll(".section-header").forEach((element) => {
        element.classList.add("is-open");
      });
      this.sectionsExpanded = true;
      e.target.label = "Collapse All";
    }
  }

  /******************** 
    Sidebar Methods Start 
    ********************/

  //Tampermonkey Event Handler
  receiveMessage = (event) => {
    try {
      this.isOpen = event.detail;
      localStorage.setItem("isCustomGuidanceCenterOpenLWC", event.detail.toString());
    } catch (err) {
      console.log("err : ", err);
    }
  };

  closeSidebar() {
    this.isOpen = false;
    localStorage.setItem("isCustomGuidanceCenterOpenLWC", false);
    document.dispatchEvent(
      new CustomEvent("deRYHighlightTrailheadIcon", {
        detail: false,
        bubbles: true
      })
    );
  }

  /******************** 
    Sidebar Methods End 
    ********************/

  get sidebarClass() {
    return `customGuidanceCenter wrapper slds-panel slds-grid slds-grid_vertical slds-is-fixed ${
      this.isExpanded ? "opened expanded" : this.isOpen ? "opened" : ""
      }`;
  }

  get showIllustation() {
    return !this.isLoading && !this.program && !this.allPrograms;
  }

  get headerTitle() {
    return this.isShowAllPrograms ? "Guidance Center" : this.program?.Name;
  }

  get isShowProgramDetails() {
    return this.program && (this.isShowAllPrograms === false && this.isShowLessonDetails === false);
  }
}