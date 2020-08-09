import React, { createRef, useState, useEffect } from 'react';
import { Row, Card, CardTitle, Label, FormGroup, Button } from 'reactstrap';
import { NavLink, Redirect, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

import { Formik, Form, Field } from 'formik';
import { NotificationManager } from '../../../components/common/react-notifications';

import { login, updateLogin } from '../../../redux/actions';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import IntlMessages from '../../../helpers/IntlMessages';
import Breadcrumb from '../../../containers/navs/Breadcrumb';

import { getAdminInfo, updateAdminProfile } from '../../../utils';





const validateEmail = (value) => {
    let error;
    if (!value) {
        error = 'Please enter your email address';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
        error = 'Invalid email address';
    }
    return error;
};

const validateName = (value) => {
    let error;
    if (!value) {
        error = 'Please enter name';
    } else if (value.length < 4) {
        error = 'Value must be longer than 3 characters';
    }
    return error;
};

const PasswordPage = ({ history, match, loading, login, message, loginUserAction, updateLoginAction }) => {
    let avatarInput = null;
    // const history = useHistory();
    const [email] = useState('');
    const [password, setPassword] = useState('');
    const [username] = useState('');
    const [cpassword] = useState('');
    const [avatar, setAvatar] = useState('/assets/img/no_profile.png')
    // const [loading, setLoading] = useState(false);

    useEffect(() => {
        getAdminInfo().then((info) => {
            console.log(info);
        })
        return () => {
    
        }
    }, [match]);

    useEffect(() => {

        // if (login) {
        //   history.push('/app');
        // }

        return () => { }
    }, [login, message]);

    const onUpdateProfile = (values) => {
        console.log('[form value]', values, avatarInput.files[0]);
        updateAdminProfile(values, avatarInput.files[0]);
        // if (!loading) {
        //     if (values.email !== '' && values.password !== '') {
        //         // setLoading(true);
        //         loginUserAction(values);
        //     }
        // }
    };
    const openFileSelector = () => {
        avatarInput.click();
    }
    const handleAvatarSelect = (e) => {
        console.log(e)
        e.preventDefault();
        let reader = new FileReader();
        let file = e.target.files[0];
        console.log(avatarInput.files[0]);
        setAvatar(URL.createObjectURL(e.target.files[0]));
        // reader.onloadend = (theFile) => {
        //     // var data = {
        //     //     blob: theFile.target.result, name: file.name,
        //     //     visitorId:  this.props.socketio.visitorId
        //     // };
        //     // console.log(this.props.socketio);
        //     // this.props.socketio.emit('file-upload', data);
        // };
        // reader.readAsDataURL(file);
    }
    const validateCPassword = (value) => {
        let error;
        if (password !== value) {
            error = 'Password does not match!';
        }
        return error;
    }
    const validatePassword = (value) => {
        value = password;
        let error;
        if (!value) {
            error = 'Please enter your password';
        } else if (value.length < 4) {
            error = 'Value must be longer than 3 characters';
        }
        return error;
    };
    const onPasswordChange = (e) => {
        setPassword(e.target.value);
    }

    const initialValues = { password, cpassword };

    return (
        <>
            <Row>
                <Colxx xxs="12">
                    <Breadcrumb heading="menu.password" match={match} />
                    <Separator className="mb-5" />
                </Colxx>
            </Row>

            <Row >

                <Colxx xxs="12">
                    <h3 className="mb-4">
                        <IntlMessages id="pages.password" />
                    </h3>
                </Colxx>


                <Formik initialValues={initialValues} onSubmit={onUpdateProfile}>
                    {({ errors, touched }) => (
                        <Form className="av-tooltip tooltip-label-bottom mx-auto" style={{maxWidth: 640, width: '100%'}}>
                            <FormGroup className="form-group has-float-label">
                                <Label>
                                    <IntlMessages id="user.password" />
                                </Label>
                                <Field
                                    className="form-control"
                                    type="password"
                                    name="password"
                                    value={password}
                                    validate={validatePassword}
                                    onChange={onPasswordChange}
                                />
                                {errors.password && touched.password && (
                                    <div className="invalid-feedback d-block">
                                        {errors.password}
                                    </div>
                                )}
                            </FormGroup>
                            <FormGroup className="form-group has-float-label">
                                <Label>
                                    <IntlMessages id="user.confirm-password" />
                                </Label>
                                <Field
                                    className="form-control"
                                    type="password"
                                    name="cpassword"
                                    validate={validateCPassword}
                                />
                                {errors.cpassword && touched.cpassword && (
                                    <div className="invalid-feedback d-block">
                                        {errors.cpassword}
                                    </div>
                                )}
                            </FormGroup>

                            <div className="d-flex justify-content-end align-items-center">
                                <Button
                                    type="submit"
                                    color="primary"
                                    className={`btn-shadow btn-multiple-state ${
                                        loading ? 'show-spinner' : ''
                                        }`}
                                    size="lg"
                                >
                                    <span className="spinner d-inline-block">
                                        <span className="bounce1" />
                                        <span className="bounce2" />
                                        <span className="bounce3" />
                                    </span>
                                    <span className="label">
                                        <IntlMessages id="user.update" />
                                    </span>
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>

            </Row>
        </>
    );
};

const mapStateToProps = ({ auth }) => {
    // const { loading, error } = authUser;
    const { loading, login, message } = auth;
    // return { loading, error };
    return { error: false, login, loading, message };
};

export default connect(mapStateToProps, {
    loginUserAction: login,
    updateLoginAction: updateLogin
})(PasswordPage);