import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import {Button, Card, Col, Form, Input, Row} from 'antd';
import moment from 'moment';

import DescriptionList from '../../../components/DescriptionList';
import StandardTable from '../../../components/StandardTable';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

import styles from '../../../assets/less/List.less';
import {userInfoUtil as userUtil} from "../../../utils/UserInfoUtil";
import flowRecord from './../../../utils/flowRecord'

const FormItem = Form.Item;
const { Description } = DescriptionList;

@connect(({company,emp,loading}) => ({
  company,
  emp,
  loading: loading.models.emp,
}))
@Form.create()
export default class CompanyDetail extends PureComponent {
  state = {
    formValues: {},
  };
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

    //获取当前公司的薪资历史
    dispatch({
      type:'emp/list',
      payload:{
        companyId: match.params.id
      }
    });

    this.setState({
      formValues: {
        companyId: match.params.id
      },
    })
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
    const { dispatch } = this.props;
    const { formValues } = this.state;

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
      type: 'emp/list',
      payload: params,
    });
  }

  //重置搜索框
  handleSearchReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.setState({searchParams:{startDate:null,endDate:null, uploadUserId:null}});
    this.queryEmpList();
  }

  //处理历史记录页面查询的函数
  handleSearch = (e) => {
    e.preventDefault();
    this.queryEmpList();
  }

  //执行员工列表查询
  queryEmpList() {
    const {dispatch, form, match} = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      //取出表中字段
      const values = {
        companyId: match.params.id,
        ...fieldsValue
      };

      this.setState({
        formValues: values,
      });

      // 向服务器请求数据
      dispatch({
        type:'emp/list',
        payload: values,
      });
    });
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{md: 8, lg: 24, xl: 48}}>
          <Col md={4} sm={12}>
            <FormItem label="姓名">
              {getFieldDecorator('name')(
                <Input placeholder="姓名"/>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={12}>
            <FormItem label="手机号">
              {getFieldDecorator('phone')(
                <Input placeholder="手机号"/>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={18}>
            <FormItem label="身份证号">
              {getFieldDecorator('idcard')(
                <Input placeholder="身份证号"/>
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
    const { company:{currentItem}, emp:{data}, loading}= this.props;
    console.log("empList", data);
    const {bizCustomer:{salaryPlatform}} = userUtil.getCurrentUser();
    const wechatStatus = ['未绑定', '已绑定'];
    const Status = ['待认证', '认证成功', '认证失败'];
    let columns =[
      {
        title: '序号',
        key: 'index',
        render(text, record, index) {
          return <span>{(data.current-1)*data.size+index+1}</span>
        }
      },
      {
        title: '姓名',
        dataIndex: 'name',
      },
      {
        title: '手机号',
        dataIndex: 'phone',
      },
      {
        title: '身份证号',
        dataIndex: 'idcard',
      },
      {
        title: '微信状态',
        dataIndex: 'wechatState',
        render(val) {
          return <span>{wechatStatus[val]}</span>
        }
      },
      {
        title: '认证状态',
        dataIndex: 'jdjrState',
        render(val) {
          return
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      }];
      if(salaryPlatform == 'pingan' ){
        columns = columns.filter(item => item.title != "认证状态");
      }
    const description = (
      <DescriptionList size="large">
        <Description term="当前状态">{currentItem.state=='1'?"正常":"关闭"}</Description>
        <Description term="负责人" >{currentItem.manager.realName}</Description>
        <Description term="添加人">{currentItem.createUser?currentItem.createUser.realName:''}</Description>
        <Description term="添加时间">{moment(currentItem.createTime).format('YYYY-MM-DD HH:mm:ss')}</Description>
        <Description term="最近修改">{currentItem.updateUser?currentItem.updateUser.realName:'无'}</Description>
        <Description term="修改时间">{currentItem.updateTime ? moment(currentItem.updateTime).format('YYYY-MM-DD HH:mm:ss'):'无'}</Description>
      </DescriptionList>
    )

    return (
      <PageHeaderLayout
        title={"企业名称：" + currentItem.name}
        content={description}
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
