import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import moment from 'moment';
import numeral from 'numeral';
import {Button, Card, Col, DatePicker, Form, Icon, Row, Select, Steps, Upload, Spin, message} from 'antd';
import salaryUploadStyle from './SalaryUpload.less';
import StandardTable from '../../../components/StandardTable';
import flowRecord from './../../../utils/flowRecord'

const { Option } = Select;
const Step = Steps.Step;
const { MonthPicker } = DatePicker;

@connect(({salaryUpload,formModel, loading}) => ({
  salaryUpload,
  formModel,
  loading: loading.models.salaryUpload,
}))
@Form.create()
export default class SalaryUpload extends PureComponent {
  state = {
    step: 1,
    showSalaryUploadRange:false,
    uploadExcelErrorContent:"",
    salaryDetailList: [],
    salaryTemplateFields: [],
    company: {},
    startValue: moment().subtract(1, "month"),
    endValue: moment().subtract(1, "month"),
    startDate: moment().subtract(1, "month").format('YYYY-MM'),
    endDate: moment().subtract(1, "month").format('YYYY-MM'),
    dataFile: {},
    batch: '',
    salarySum: 0,
  }
  componentWillMount() {
    flowRecord();
  }
  componentDidMount(){
    this.setState({step: 1});
    this.props.dispatch({
      type: 'salaryUpload/init'
    });
  }

  componentWillReceiveProps(nextState, nextProps){
    let { salaryUpload: {salaryTemplateFields = [], salaryDetailList = [], batch, salarySum}} = nextState;
    this.setState({ salaryTemplateFields, salaryDetailList, batch, salarySum})
  }

  nextStep = () =>{
    const {step, company, startDate, endDate, dataFile, batch} = this.state;
    this.setState({uploadExcelErrorContent:""});//重置错误信息
    if (step == 1) {
      if (!company.id) {
        message.error('请选择发薪企业');
        return;
      }
      if (!startDate || !endDate) {
        message.error('请选择发薪时间');
        return;
      }
      this.setState({step: this.state.step + 1});
    }

    if (step == 2) {
      if (dataFile && dataFile.name) {
        this.props.dispatch({
          type:'salaryUpload/uploadSalaryFile',
          payload: {
            companyId: company.id,
            startDate,
            endDate,
            dataFile
          },
        }).then((response) => {
          if (response.code == 0) {
            this.setState({step: this.state.step + 1});
          }else if (response.code == 2){
            this.setState({uploadExcelErrorContent:response.msg});
          }
        });
      } else{
        message.error('请选择发薪文件');
      }
    }

    if (step == 3) {
      if (batch) {
        this.props.dispatch({
          type: 'salaryUpload/confirm',
          payload: {
            batch,
            companyId: company.id,
            startDate,
            endDate,
            dataFile
          },
        }).then((response) => {
          if (response.code === 0) {
            this.setState({step: this.state.step + 1});
          }
        });
      } else{
        message.error('系统异常，请重试');
      }
    }
  }

  pervStep = () =>{
    this.setState({step: this.state.step - 1,uploadExcelErrorContent:""})//重置错误信息
  }

  /**
   * 选好发薪月份后的回调函数
   */
  salaryUploadMonthHandler = (data,dataString) => {
    this.setState({
      startValue: data,
      endValue: data,
      startDate: dataString,
      endDate: dataString,
    });
  }

  /**
   * 选好起始月份后的回调函数
   */
  salaryUploadStartMonthHandler = (data, dataString) => {
    this.setState({
      startDate: dataString,
      startValue: data
    });
  }
  salaryUploadStartMonthCheckDate = (startValue) =>{
    const endValue = this.state.endValue;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }

  /**
   * 选好结束月份后的回调函数
   */
  salaryUploadEndMonthHandler = (data, dataString) => {
    console.info('month', data);
    console.info('month', dataString);
    this.setState({
      endDate: dataString,
      endValue: data
    });
  }
  salaryUploadEndMonthCheckDate = (endValue) =>{
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }

  /**
   * 处理表格的分页，过滤，排序器
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const {dispatch,salaryUpload:{formValues}} = this.props;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = {...obj};
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      current: pagination.current,
      size: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      if (sorter.order == 'ascend') {
        params.ascs = sorter.field;
      } else {
        params.descs = sorter.field;
      }
    }
    dispatch({
      type:'salaryUpload/querySalaryDetail',
      payload: {
        batch: this.state.batch,
        companyId: this.state.company.id,
        ...params,
      },
    });
  }

  //上传组件需要的参数
  beforeUpload = (file, fileList)=>{
    this.setState({ dataFile: file });
    return false;
  }

  uploadChange = (info) => {
    let fileList = info.fileList;
    console.log("fileList", fileList)
    fileList = fileList.slice(0,1);
    // const isExcel = fileList[0].type === 'application/vnd.ms-excel' || fileList[0].type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    // if (!isExcel) {
    //   fileList[0].status = "error";
    // }
    this.setState({fileList});
  }

  /**
   * 发薪完毕点击完成时的回调函数
   */
  handleSalaryUploadDone = () => {
    this.setState({
      step:1,
      salaryDetailList: [],
      salaryTemplateFields: [],
      company: {},
      startValue: moment().subtract(1, "month"),
      endValue: moment().subtract(1, "month"),
      startDate: moment().subtract(1, "month").format('YYYY-MM'),
      endDate: moment().subtract(1, "month").format('YYYY-MM'),
      dataFile: {},
      batch: '',
    })
  }

  /**
   * 选择公司后的回调函数
   */
  handleSelectCompany=(value)=>{
    console.log("valuevv:",value);
    const { companyList } = this.props.salaryUpload;
    const company = companyList.filter(item => item.id==value)[0];
    this.setState({company})
  }

  /**
   * 显示发薪区间
   */
  showSalaryUploadRange=()=>{
    this.setState({showSalaryUploadRange:!this.state.showSalaryUploadRange, endValue: this.state.startValue, endDate: this.state.endDate})
  }

  /**
   * 渲染步骤一
   */
  renderStepOne =()=>{
    const { companyList } = this.props.salaryUpload;
    const { company, showSalaryUploadRange } = this.state;
    return (
      <div>
        <Row type="flex" align="center" gutter={8}>
          <Col>
            <Select placeholder="请选择发薪企业" defaultValue={company.id}  onChange={this.handleSelectCompany} style={{ width: 150 }}>
              {companyList.map(company => <Option value={company.id} key={company.id}>{company.name}</Option>)}
            </Select>
          </Col>
          <Col >
            {showSalaryUploadRange || <MonthPicker  value={this.state.startValue} placeholder="请选择月份" onChange={this.salaryUploadMonthHandler}/>}
            {showSalaryUploadRange && <span>
              <MonthPicker placeholder="请选择起始月份" disabledDate={this.salaryUploadStartMonthCheckDate} value={this.state.startValue} onChange={this.salaryUploadStartMonthHandler}/>
              <MonthPicker placeholder="请选择结束月份" className={salaryUploadStyle.range_select_right} disabledDate={this.salaryUploadEndMonthCheckDate}  value={this.state.endValue} onChange={this.salaryUploadEndMonthHandler}/>
            </span>
            }
          </Col>
          <Col>
            <a className={salaryUploadStyle.select_time_button} onClick={this.showSalaryUploadRange}>{showSalaryUploadRange?"取消":"自定义发薪区间"}</a>
          </Col>
        </Row>
        <Row type="flex" align="center" justify="start" style={{margin:"30px 0 0 0"}} gutter={10}>
          <div><Col><Button onClick={this.nextStep}>下一步</Button></Col></div>
        </Row>
      </div>);
  }
  /**
   * 渲染步骤二，上传excel界面
   */
  renderUploadExcel=()=>{
    return (
      <div>
        <div style={{height:"30px"}}>所上传的工资表中必须包含：姓名，应发工资，身份证号，银行卡号，手机号等信息</div>
        <div style={{height:"30px"}}>建议上传工资条形式，以便于领到工资的员工能及时查看工资条</div>
        <div style={{height:"30px"}}>
          <Upload onChange={this.uploadChange} beforeUpload={this.beforeUpload} fileList={this.state.fileList} accept={".xls,.xlsx"}><Button type="primary"><Icon type="upload"/> 上传整理好的Excel工资表</Button></Upload>
        </div>
        <div className={salaryUploadStyle.errorContent} dangerouslySetInnerHTML = {{ __html:this.state.uploadExcelErrorContent }}></div>
        <Row type="flex" align="center" justify="start" style={{margin:"30px 0 0 0"}} gutter={10}>
          <div>
            <Col span={10}><Button onClick={this.pervStep}>上一步</Button></Col>
            <Col span={4}> </Col><Col span={10}><Button onClick={this.nextStep}>下一步</Button></Col>
          </div>
        </Row>
      </div>
    );
  }

  /**
   * 渲染步骤三，核对工资表
   */
  renderSalaryTable=()=>{
    const {salaryUpload:{salaryTemplateFields, salaryDetailList}, loading}= this.props;
    const selectCompany = this.state.company;
    //根据模板生成列名
    const columns = salaryTemplateFields.map(field =>{
      let c = {
        title: field.fieldName,
        dataIndex: field.fieldName
      }
      if (field.fieldName == '实发工资') {
        c = {
          ...c,
          align: 'right',
          render: (val) => {
            return numeral(val).format('0,0.00');
          }
        }
      }
      return c;
    });
    console.log("colums",columns)

    const data = {
      ...salaryDetailList,
      records : salaryDetailList.records.map(detail =>{
        return detail.jsonMap;
      })
    }

    return(
      <div className={salaryUploadStyle.table}>
        <p>核对工资表</p>
        <p>
          {selectCompany&&selectCompany.name} {this.state.startDate == this.state.endDate ? this.state.startDate : (this.state.startDate + '-' + this.state.endDate)} 月工资
          共 <b>{salaryDetailList.total}</b> 人   总计应发：<b style={{color:"red"}}>{this.state.salarySum}</b> 元 <span style={{color:"red"}}>详情见下表</span>
        </p>
        <StandardTable
          data={data}
          columns={columns}
          onChange={this.handleStandardTableChange}
          scroll={{x:'100%'}}
        />
        <Row type="flex" align="center" justify="start" style={{margin:"30px 0 0 0"}} gutter={10}>
          <div><Col span={10}><Button onClick={this.pervStep}>上一步</Button></Col><Col span={4}> </Col><Col span={10}><Button type="primary" onClick={this.nextStep}>确认无误，提交</Button></Col></div>
        </Row>
      </div>
    )
  }

  /**
   * 渲染上传成功提示
   */
  renderSalaryUploadSuccess=()=>{
    return (
      <div>
        <Row type="flex" align="center" gutter={8} justify="center" >
          <Col style={{fontSize:"20px"}}><b>工资表上传成功！</b></Col>
        </Row>
        <Row type="flex" align="center" style={{marginTop:"20px"}}><Button type="primary" onClick={this.handleSalaryUploadDone}>完成</Button></Row>
      </div>
    )
  }

  /**
   * 根据 step 渲染不同的 step
   */
  renderSteps=(step)=> {
    if (step === 1){
      return this.renderStepOne()
    }else if(step===2){
      return this.renderUploadExcel()
    }else if(step===3){
      return this.renderSalaryTable()
    }else{
      return this.renderSalaryUploadSuccess()
    }
  }

  render() {
    const { step } = this.state;
    return (
      <Spin spinning={this.props.loading}>
        <div>
          <Card bordered={false}>
            <Steps current={step-1}>
              <Step key="1" title="选企业，年月"/>
              <Step key="2" title="上传工资表"/>
              <Step key="3" title="核对工资表"/>
            </Steps>
            <Card className={salaryUploadStyle.chooseSalaryTemplateCard}>
              {this.renderSteps(step)}
            </Card>
          </Card>
        </div>
      </Spin>
    )
  }
}
