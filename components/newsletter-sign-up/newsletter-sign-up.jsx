import React from "react";
import ReactGA from "react-ga";
import classNames from "classnames";
import Service from "../../js/service";
import user from "../../js/app-user";

class NewsletterSignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiSubmitted: false,
      apiSuccess: false,
      apiFailed: false,
      userTriedSubmitting: false
    };
  }

  /**
   * Ensure that the parent component is informed
   * about this component being mounted (primarily
   * used in the context of automated testing)
   */
  componentDidMount() {
    user.addListener(this);
    user.verify(this.props.location, this.props.history);
  }

  componentWillUnmount() {
    user.removeListener(this);
  }

  updateUser(event) {
    // this updateUser method is called by "user" after changes in the user state happened
    if (event === `verified`) {
      this.setState({
        user
      });
    }
  }

  // state update function
  apiSubmissionSuccessful() {
    this.setState({
      apiSuccess: true
    });
  }

  // state update function
  apiSubmissionFailure(e) {
    if (e && e instanceof Error) {
      this.setState({
        apiFailed: true
      });
    }
  }

  // state check function
  apiIsDone() {
    return (
      this.state.apiSubmitted && (this.state.apiSuccess || this.state.apiFailed)
    );
  }

  /**
   * Submit the user's data to the API server.
   */
  submitDataToApi() {
    this.setState({ apiSubmitted: true });

    return Service.signUp(this.email.value, window.location.toString())
      .then(() => {
        this.apiSubmissionSuccessful();
      })
      .catch(reason => {
        console.error(reason);
        this.apiSubmissionFailure(reason);
      });
  }

  /**
   * Performs very simple validation for emails.
   * @param {string} input the string that should be validated as an email address
   * @returns {boolean} true if the input is a legal-enough email address, else false
   */
  validatesAsEmail(input) {
    if (!input) {
      return false;
    }
    return input.match(/[^@]+@[^.@]+(\.[^.@]+)+$/) !== null;
  }

  /**
   * Process the form data, to make sure there is a valid
   * email address, and the consent checkbox has been checked,
   * before proceding with a data post to the API server.
   */
  processFormData(event) {
    this.setState({ userTriedSubmitting: true });
    event.preventDefault();

    // validate data here. Do not continue unless we're cool.
    let email = this.email.value;
    let consent = this.privacy.checked;

    if (email && this.validatesAsEmail(email) && consent) {
      this.submitDataToApi();
    }

    ReactGA.event({
      category: `signup`,
      action: `form submit tap`,
      label: `Signup submitted`
    });
  }

  /**
   * GA event when users interact with the signup form.
   */
  onInputFocus() {
    ReactGA.event({
      category: `signup`,
      action: `form focus`,
      label: `Signup form input focused`
    });
  }

  /**
   * Render the signup CTA.
   */
  render() {
    if (user.loggedin !== true) {
      // Currently only authenticated user can sign up for newsletter
      // Don't show form if user is not authenticated.
      return null;
    }

    let signupState = classNames({
      "signup-success": this.state.apiSuccess && this.state.apiSubmitted,
      "signup-fail": !this.state.apiFailed && this.state.apiSubmitted
    });

    let layoutClass =
      this.props.layout === `2-column` ? `col-12 col-md-6` : `col-12`;

    return (
      <div className="newsletter-sign-up mb-5">
        <div className={`row ${signupState}`}>
          <div className={layoutClass}>{this.renderFormHeading()}</div>
          <div className={layoutClass}>{this.renderFormContent()}</div>
        </div>
      </div>
    );
  }

  /**
   * Render the CTA heading.
   */
  renderFormHeading() {
    return (
      <div>
        <h5 className="h5-heading">
          {!this.state.apiSuccess ? `${this.props.ctaHeader}` : `Thanks!`}
        </h5>
        {!this.state.apiSuccess ? (
          <p
            dangerouslySetInnerHTML={{
              __html: this.props.ctaDescription
            }}
          />
        ) : (
          <p
            dangerouslySetInnerHTML={{
              __html: this.props.thankYouMessage
            }}
          />
        )}
      </div>
    );
  }

  /**
   * Render the email field in signup CTA.
   */
  renderEmailField() {
    let classes = classNames(`mb-2`, {
      "has-danger":
        !this.email ||
        (!this.state.apiSuccess &&
          this.state.userTriedSubmitting &&
          !this.validatesAsEmail(this.email.value)) ||
        this.state.signupFailed
    });

    return (
      <div className={classes}>
        <input
          type="email"
          className="form-control"
          placeholder="Enter email address"
          ref={el => (this.email = el)}
          onFocus={evt => this.onInputFocus(evt)}
        />
        {this.state.userTriedSubmitting &&
          !this.state.apiSubmitted &&
          !this.validatesAsEmail(this.email.value) && (
            <p className="body-small form-check form-control-feedback">
              Please enter your email
            </p>
          )}
        {this.state.signupFailed && (
          <small className="form-check form-control-feedback">
            Something went wrong. Please check your email address and try again
          </small>
        )}
      </div>
    );
  }

  /**
   * Render the privacy field in signup CTA.
   */
  renderPrivacyField() {
    let classes = classNames(
      this.props.buttonPosition === `side` ? `mb-2` : `my-3`,
      {
        "form-check": true,
        "has-danger":
          !this.state.apiSuccess &&
          this.state.userTriedSubmitting &&
          !this.privacy.checked
      }
    );

    return (
      <div className={classes}>
        <label className="form-check-label">
          <input
            type="checkbox"
            className="form-check-input"
            id="PrivacyCheckbox"
            ref={el => (this.privacy = el)}
          />
          <p className="d-inline-block body-small my-0">
            I'm okay with Mozilla handling my info as explained in this{" "}
            <a href="https://www.mozilla.org/privacy/websites/">
              Privacy Notice
            </a>
          </p>
          {this.state.userTriedSubmitting &&
            !this.state.apiSubmitted &&
            !this.privacy.checked && (
              <p className="body-small form-check form-control-feedback">
                Please check this box if you want to proceed
              </p>
            )}
        </label>
      </div>
    );
  }

  /**
   * Render the submit button in signup CTA.
   */
  renderSubmitButton() {
    return <button className="btn btn-primary w-100">Sign up</button>;
  }

  /**
   * Render the actual CTA form, with an email
   * field and a consent checkbox.
   */
  renderFormContent() {
    if (this.state.apiSuccess) return null;

    let formClass = `d-flex flex-column`;
    let fieldsWrapperClass = `w-100`;
    let submitWrapperClass = `w-100`;

    if (this.props.buttonPosition === `side`) {
      formClass = `${formClass} flex-md-row`;
      fieldsWrapperClass = ``;
      submitWrapperClass = `ml-md-3`;
    }

    return (
      <form
        noValidate
        onSubmit={evt => this.processFormData(evt)}
        className={formClass}
      >
        <div className={`fields-wrapper ${fieldsWrapperClass}`}>
          {this.renderEmailField()}
          {this.renderPrivacyField()}
        </div>
        <div className={submitWrapperClass}>{this.renderSubmitButton()}</div>
      </form>
    );
  }
}

NewsletterSignUp.defaultProps = {
  ctaHeader: `Protect the internet as a global public resource`,
  ctaDescription: `Join our email list to take action and stay updated!`,
  thankYouMessage: `If you haven’t previously confirmed a subscription to a Mozilla-related newsletter you may have to do so. <strong>Please check your inbox or your spam filter for an email from us.</strong>`,
  newsletter: `mozilla-foundation`
};

export default NewsletterSignUp;
