import {render} from 'react-dom'
import React, {Component, PropTypes} from 'react'
import StepMenuCreateAppt from './directive/create_appt/step_menu'
import StepAppointment from './directive/create_appt/appointment'
import StepPatient from './directive/create_appt/patient'
import Form from '../../modules/form'
import DataObjectParser from 'dataobject-parser'
import ValidateCreateAppt from './directive/create_appt/validate'
import Services from '../../services/restfulAPI'
class CreateAppt extends Component {
    constructor() {
        super()
        //init value default
        this.valueDefaultAppt = {
            Appointment_Type: 'Onsite',
            Appointment_Data_PreferedDate: moment().format('DD/MM/YYYY'),
            Appointment_Data_PreferedTime: moment().format('HH:mm'),
            Service_ID: 1,
            Appointment_SiteID: 1
        }
        this.valueDefaultPatient = {
            Appointment_Data_Patient_Title: 'Mr',
            Appointment_Data_Patient_DOB: moment().format('DD/MM/YYYY'),
            Appointment_Data_Patient_Country: 'Australia',
            Appointment_Data_Patient_GenderRadio: 'Male',
            Appointment_Data_Patient_IndigenousStatus: 'None',
            Appointment_Data_Patient_Interpreter: 'N',
            Appointment_Data_Patient_InterperterLanguage: 'English (United States)',
            //Kin - GP
            hasKin: 'N',
            hasGP: 'N',
            Appointment_Data_PatientKin_Country: 'Australia'
        }
    }
    componentDidMount() {
        //init Form wizard
        FormWizard.init({
            validate: ValidateCreateAppt
        })
        //load list Service
        Services.listService()
            .then(function(response) {
                if (!_.isEmpty(response) &&
                    !_.isEmpty(response.data) &&
                    !_.isEmpty(response.data.data)) {
                    var data = []
                    _.forEach(response.data.data, function(service_v, service_i) {
                        data.push({ value: service_v.ID, name: service_v.ServiceName })
                    })
                    this.dataService = data
                        //load list Site
                    return Services.listSite()
                } else {
                    toastr.error('Load Service failed!', 'Error')
                }
            }.bind(this), function(err) {
                toastr.error('Load Service failed!', 'Error')
            })
            .then(function(response) {
                if (!_.isEmpty(response) &&
                    !_.isEmpty(response.data) &&
                    !_.isEmpty(response.data.data)) {
                    var data = []
                    _.forEach(response.data.data, function(site_v, site_i) {
                        data.push({ value: site_v.ID, name: site_v.SiteName })
                    })
                    this.dataSite = data
                    return Services.listCountry()
                } else {
                    toastr.error('Load Site failed!', 'Error')
                }
            }.bind(this), function(err) {
                toastr.error('Load Site failed!', 'Error')
            })
            .then(function(response) {
                if (!_.isEmpty(response) &&
                    !_.isEmpty(response.data) &&
                    !_.isEmpty(response.data.data)) {
                    var data = []
                    _.forEach(response.data.data, function(country_v, country_i) {
                        data.push({ value: country_v.ShortName, name: country_v.ShortName })
                    })
                    this.dataCountry = data
                    return Services.listLanguage()
                } else {
                    toastr.error('Load Country failed!', 'Error')
                }
            }.bind(this), function(err) {
                toastr.error('Load Country failed!', 'Error')
            })
            .then(function(response) {
                if (!_.isEmpty(response) &&
                    !_.isEmpty(response.data)) {
                    var data = []
                    _.forEach(response.data, function(language_v, language_i) {
                        data.push({ value: language_v.Language, name: language_v.Language })
                    })
                    this.dataLanguage = data
                    this.forceUpdate()
                } else {
                    toastr.error('Load Language failed!', 'Error')
                }
            }.bind(this), function(err) {
                toastr.error('Load Language failed!', 'Error')
            })

    }
    _onSubmit() {
        //replace all charater "find" by "replace"
        function replaceAll(str, find, replace) {
             return str.replace(new RegExp(find, 'g'), replace)
        }
        //parse data string to json with DataObjectParser
        var daOP = new DataObjectParser()
        var serializedObject = this.refs.formSubmit._getSerializedObject()
        var dataObject = {}
        //parse data
        if (!_.isEmpty(serializedObject)) {
            if (serializedObject.Appointment_Data_PreferedDate != '') {
                serializedObject.Appointment_Data_PreferedDate =
                    moment(serializedObject.Appointment_Data_PreferedDate, 'DD/MM/YYYY').format('YYYY-MM-DD HH:mm:ss Z')
            }
            if (serializedObject.Appointment_Data_Patient_Gender == '') {
                serializedObject.Appointment_Data_Patient_Gender = serializedObject.Appointment_Data_Patient_GenderRadio
            }
            _.forEach(serializedObject, function(val, key){
                if(serializedObject[key] != '') {
                    dataObject[key] = serializedObject[key]
                }
            })
        }
        //set data for Submit date
        dataObject.Appointment_RequestDate = moment().format('YYYY-MM-DD HH:mm:ss Z')
       _.forEach(dataObject, function(val, key){
            var keyTemp = replaceAll(key,'_','.')
            daOP.set(keyTemp, val)
        })
       App.blockUI({
            arget: '#blockui_sample_1_portlet_body',
            animate: true
        })
       Services.CreateAppointment({ data: daOP._data })
        .then(function(response) {
            App.unblockUI()
            toastr.success('Create Appointment success!', 'Success')
            $(this.refs.confirm_create_appt).addClass('hide')
            $(this.refs.noty_create_appt).removeClass('hide')
            $(this.refs.button_continue).removeClass('hide')
            $(this.refs.button_submit).addClass('hide')
        }.bind(this), function(err) {
            if (err &&
                err.status == 401) {
                //go to login page
            } else {
                toastr.error('Request Appointment failed!', 'Error')
            }
        })
    }
    render() {
        return (
                <div className="page-content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="portlet light bordered" id="form_wizard_1">
                                <div className="portlet-title">
                                    <div className="caption">
                                        <i className=" icon-layers font-red"></i>
                                        <span className="caption-subject font-red bold uppercase"> Create new appointment -
                                            <span className="step-title"> Step 1 of 3 </span>
                                        </span>
                                    </div>
                                    <div className="actions">
                                        <a className="btn btn-circle btn-icon-only btn-default" href="javascript:;">
                                            <i className="icon-cloud-upload"></i>
                                        </a>
                                        <a className="btn btn-circle btn-icon-only btn-default" href="javascript:;">
                                            <i className="icon-wrench"></i>
                                        </a>
                                        <a className="btn btn-circle btn-icon-only btn-default" href="javascript:;">
                                            <i className="icon-trash"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="portlet-body form">
                                    <Form ref="formSubmit" onSubmit={this._onSubmit.bind(this)} className="form-horizontal" id="submit_form">
                                        <div className="form-wizard">
                                            <div className="form-body">
                                        {/*menu*/}
                                               <StepMenuCreateAppt />
                                                <div id="bar" className="progress progress-striped" role="progressbar">
                                                    <div className="progress-bar progress-bar-success"> 
                                                    </div>
                                                </div>
                                                <div className="tab-content">
                                                    <div className="alert alert-danger display-none">
                                                        <a className="close" data-dismiss="alert"></a> 
                                                        You have some form errors. Please check below. 
                                                    </div>
                                                    <div className="alert alert-success display-none">
                                                        <a className="close" data-dismiss="alert"></a> 
                                                        Your form validation is successful! 
                                                    </div>
                                                {/*Appointment infomation*/}
                                                    <StepAppointment defaultValue={this.valueDefaultAppt} 
                                                    data={{dataService: this.dataService, dataSite: this.dataSite}}/>
                                                {/*Patient infomation*/}
                                                    <StepPatient defaultValue={this.valueDefaultPatient} 
                                                    data={{dataCountry: this.dataCountry, dataLanguage: this.dataLanguage}}/>
                                                    <div className="tab-pane" id="consent">
                                                        <h3 className="block text-success">Consent</h3>
                                                        <div ref="confirm_create_appt">
                                                            <h4>Next make Appointment</h4>
                                                            <div>Are you sure make this appointment ?</div>
                                                        </div>
                                                        <div ref="noty_create_appt" className="hide">
                                                            <h4>Create Appointment success</h4>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-actions right">
                                                <a href="javascript:;" className="btn default button-previous">
                                                    <i className="fa fa-angle-left"></i> Back </a>
                                                <a href="javascript:;" className="btn btn-outline green button-next"> Continue
                                                    <i className="fa fa-angle-right"></i>
                                                </a>
                                                <a ref="button_continue" href="javascript:;" className="btn btn-outline green hide"> Continue
                                                    <i className="fa fa-angle-right"></i>
                                                </a>
                                                <button ref="button_submit" type="submit" href="javascript:;" className="btn green button-submit"> Submit
                                                    <i className="fa fa-check"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </Form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
    }
}
render(
    <CreateAppt />,
    document.getElementById('app')
    )