import axios from 'axios'
import Config from '../config'

const Service = {
    makeRequest(params){
        return axios.post(Config.apiURL+'request/make', params)
    },
    detailPatient(params){
        return axios.post(Config.apiURL+'patient/detail', params);
	},
	updatePatient(params){
		return axios.post(Config.apiURL+'patient/update', params);
	},
	uploadFile(params) {
		return axios.post('http://localhost:3005/api/uploadFileWithoutLogin?userUID=2cfeebaf-48c5-4f04-8047-55ae3e680da1&fileType=ProfileImage', params);
	},
}

export default Service