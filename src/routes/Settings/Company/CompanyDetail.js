import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import moment from 'moment';
import numeral from 'numeral';
import {Card, Row, Col, Form, Select, Button, DatePicker} from 'antd';

import DescriptionList from '../../../components/DescriptionList';
import StandardTable from '../../../components/StandardTable';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

import styles from '../../../assets/less/List.less';
import flowRecord from './../../../utils/flowRecord'

const { Option } = Select;
const FormItem = Form.Item;
const { MonthPicker} = DatePicker;
const { Description } = DescriptionList;

@connect(({company,salaryHistory,loading}) => ({
  company,
  salaryHistory,
  loading: loading.models.salaryHistory,
}))
@Form.create()
export default class CompanyDetail extends PureComponent {
  state = {
    stateValue: '2,3',
    searchParams: {
      startDate: null,  //起始时间，单位毫秒
      endDate: null,
      uploadUserId: null
    }
  }
  componentWillMount() {
    flowRecord();
  }
  componentDidMount() {
    const { dispatch, match } = this.props;

    //请求数据
    dispatch({
      type: 'company/detail',
      payload:{
        id: match.params.id,
      }
    });

    dispatch({
      type: 'company/all',
    });

    //请求manager列表
    dispatch({
      type:'company/allManagers',
    });

    //获取当前公司的薪资历史
    dispatch({
      type:'salaryHistory/list',
      payload:{
        companyId: match.params.id,
        state: this.state.stateValue,
        descs: 'id'
      }
    });
  }

  handleRefresh = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'company/list',
      payload:{}
    });
  }

  //处理表格的分页，过滤，排序器
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const {dispatch, match} = this.props;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = {...obj};
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      current: pagination.current,
      size: pagination.pageSize,
      ...this.state.searchParams,
      ...filters,
    };
    if (sorter.field) {
      if (sorter.order == 'ascend') {
        params.ascs = sorter.field;
      } else {
        params.descs = sorter.field;
      }
    } else {
      params.descs = 'id';
    }
    dispatch({
      type: 'salaryHistory/list',
      payload: {
        state: this.state.stateValue,
        companyId:match.params.id,
        ...params
      },
    });
  }

  //重置搜索框
  handleSearchReset = () => {
    const {form, dispatch, match} = this.props;
    form.resetFields();
    this.setState({searchParams:{startDate:null,endDate:null, uploadUserId:null}});
    dispatch({
      type: 'salaryHistory/list',
      payload: {
        companyId:match.params.id,
        state: this.state.stateValue,
        descs: 'id'
      },
    });
  }

  //处理历史记录页面查询的函数
  handleSearch = (e) => {
    e.preventDefault();

    const {dispatch, form, match} = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      //取出表中字段
      const values = {
        ...fieldsValue
      };
      //取出 年 月
      let startDateMills = values.startDate?Date.parse(values.startDate.toString()):null;
      let endDateMills = values.endDate?Date.parse(values.endDate.toString()):null;
      this.setState({searchParams:{startDate:startDateMills,endDate:endDateMills, uploadUserId:values.uploadUserId}});
      // 向服务器请求数据
      dispatch({
        type:'salaryHistory/list',
        //这里传参取的时候不方便的话可以吧values解构
        payload: {
          companyId:match.params.id,
          state: this.state.stateValue,
          startDate:startDateMills,
          endDate:endDateMills,
          uploadUserId:values.uploadUserId,
          descs: 'id'
        },
      });
    });
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form;
    const {company:{allManagers}} = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row>
          <Col md={4} sm={12}>
              <FormItem label="发薪月份">
                {getFieldDecorator('startDate')(
                  <MonthPicker placeholder="请选择起始时间"/>
                )}
              </FormItem>
          </Col>
            <Col md={4} sm={12}>
              <FormItem label="">
                {getFieldDecorator('endDate')(
                  <MonthPicker placeholder="请选择结束时间"/>
                )}
              </FormItem>
          </Col>
          <Col md={6} sm={18}>
            <FormItem label="操作人">
              {getFieldDecorator('uploadUserId')(
                <Select  allowClear={true} placeholder="请选择" style={{ width: 180}}>
                  {allManagers.map(manager => <Option value={manager.id} key={manager.id}>{manager.realName}</Option>)}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={12}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{marginLeft: 8}} onClick={this.handleSearchReset}>重置</Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  //渲染页面
  render() {
    const { company:{currentItem}, salaryHistory:{data}, loading}= this.props;

    const columns =[
      {
        title: '发薪编号',
        dataIndex: 'id',
        sorter: true,
      },
      {
        title: '发薪月份',
        render: (text, record) => (
          <span>{record.startDate == record.endDate?record.startDate:record.startDate+' ~ '+record.endDate}</span>
        ),
      },
      {
        title: '发放人数',
        dataIndex: 'totalCount',
      },
      {
        title: '发放金额（元）',
        dataIndex: 'totalMoney',
        align: 'right',
        render: (val) => {
          return numeral(val).format('0,0.00');
        }

      },
      {
        title: '已成功人数',
        dataIndex: 'successCount',
      },
      {
        title: '已成功金额（元）',
        dataIndex: 'successMoney',
        align: 'right',
        render: (val) => {
          return numeral(val).format('0,0.00');
        }
      },
      {
        title: '失败人数',
        dataIndex: 'failCount',
      },
      {
        title: '失败金额（元）',
        dataIndex: 'failMoney',
        align: 'right',
        render: (val) => {
          return numeral(val).format('0,0.00');
        }
      },
      {
        title: '发薪状态',
        dataIndex: 'state',
        render:(text)=>{
          // 0待发薪 1发放中 2发放成功 3发放失败
          if(text=="0")
            return "待发薪";
          if(text=="1")
            return "发薪中";
          if(text=="2")
            return "已发薪";
          if(text=="3")
            return "发薪失败";
        }
      },
      {
        title: '操作人',
        dataIndex: 'uploadUser.realName',
      },
      {
        title: '操作时间',
        dataIndex: 'uploadTime',
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '操作',
        render: (text, record) => (
          <span>
           <Link to={'/salary/salaryHistory/detail/'+record.id+"/"+this.props.match.params.id}>查看详情</Link>
        </span>
        ),
      }];

    const description = (
      <DescriptionList size="large">
        <Description term="当前状态">{currentItem.state=='1'?"正常":"关闭"}</Description>
        <Description term="负责人" >{currentItem.manager.realName}</Description>
        <Description term="添加人">{currentItem.createUser?currentItem.createUser.realName:''}</Description>
        <Description term="添加时间">{moment(currentItem.createTime).format('YYYY-MM-DD HH:mm:ss')}</Description>
        <Description term="最近修改">{currentItem.updateUser?currentItem.updateUser.realName:''}</Description>
        <Description term="修改时间">{moment(currentItem.updateTime).format('YYYY-MM-DD HH:mm:ss')}</Description>
      </DescriptionList>
    )

    return (
      <PageHeaderLayout
        // title={"企业名称：" + currentItem.name}
        // content={description}
      >
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <StandardTable
              loading={loading}
              data={data}
              columns={columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </PageHeaderLayout>
    )
  }
}
