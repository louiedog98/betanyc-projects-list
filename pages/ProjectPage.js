var React = require('react/addons');
var {PropTypes} = React;
var moment = require('moment');

// Helpers
var isEmpty = require('lodash/lang/isEmpty');
var isEqual = require('lodash/lang/isEqual');
var README = 'README.md';

// Stores
var UserStore = require('stores/UserStore');
var RepoStore = require('stores/RepoStore');
var ProjectStore = require('../stores/ProjectStore');
var ReadmeStore = require('../stores/ReadmeStore');
var IssuesByRepoStore = require('../stores/IssuesByRepoStore');

// Action creators
var ProjectActionCreators = require('actions/ProjectActionCreators');
var IssueActionCreators = require('actions/IssueActionCreators');
var ContentActionCreators = require('actions/ContentActionCreators');

// Mixins
var createStoreMixin = require('mixins/createStoreMixin');

// Components
var {Link} = require('react-router');
var Breadcrumbs = require('components/Breadcrumbs');
var IssueListComponent = require('components/IssueListComponent');
var DiscussionListComponent = require('components/DiscussionListComponent');


var ProjectPage;
var ProjectHeading = React.createClass({
  render(){
    var {repo} = this.props;

    var owner = UserStore.get(repo.owner);
    var ownerLogin = owner.login;
    var ownerHtmlUrl = owner.htmlUrl;
    var ownerAvatarUrl = owner.avatarUrl;

    return <div className='container'>
        <h1>
          <a href={repo.htmlUrl} target="_blank">{repo.name} <span className='mega-octicon octicon-mark-github' /></a>
          <a href={owner.htmlUrl} title={owner.login} className='pull-right'>
            <img src={owner.avatarUrl} width={150} className='img-thumbnail'/>

          </a>
        </h1>
        <ul className='list-inline'>
          <li title='stargazers'>{repo.stargazersCount} <span className='octicon-star octicon'/></li>
          <li title='watchers'>{repo.watchersCount} <span className='octicon-eye-watch octicon'/></li>
          <li title='forks'>{repo.forks} <span className='octicon-repo-forked octicon'/></li>
          <li title='open issues'>{repo.openIssues} <span className='octicon-issue-opened octicon'/></li>
        </ul>

        <p><small>Last updated {moment(repo.pushedAt).fromNow()}</small></p>
        <p className='lead'>{repo.description}</p>
        <hr/>
        <p>{this.props.readme}</p>

      </div>
  }
});

module.exports = ProjectPage = React.createClass({
  propTypes: {
    params: PropTypes.object.isRequired,
    query: PropTypes.object.isRequired
  },
  mixins: [
    createStoreMixin(
      RepoStore,
      ProjectStore,
      ReadmeStore,
      IssuesByRepoStore
    )
  ],
  componentDidMount(){
    var {repoName} = this.props.params;
    ProjectActionCreators.requestProject({name: repoName});
    IssueActionCreators.requestRepoIssues({repoName});
    ContentActionCreators.requestRepoReadme({repoName});
  },
  getStateFromStores(props){
    var {repoName} = this.props.params;
    return {
      project: ProjectStore.getFirst({name: repoName}),
      issues: IssuesByRepoStore.getIssues(repoName)
    }
  },
  getProjectRepo(project){
    return RepoStore.get(project.githubDetails);
  },
  getRepoReadme(repo){
    let {name,owner} = repo;
    return ReadmeStore.getReadme({repoName: name, owner: owner, path: README});
  },
  render(){
    var {project} = this.state;
    var {issues} = this.state;
    if(project)
      var repo = this.getProjectRepo(project);
    if(repo)
      var readme = this.getRepoReadme(repo);
    var {repoName} = this.props.params;
    var cx = React.addons.classSet;
    let tab = this.props.query.tab;
    var readmeTabClasses = cx({active: !tab || tab == 'readme'});
    var issueTabClasses = cx({active: tab == 'issues'});
    var discussTabClasses = cx({active: tab == 'discussion'});
    var disabledTabClasses = cx({disabled: true});

    let readmeSection = readme ? <div id='readmeSection' dangerouslySetInnerHTML={{__html: readme}} /> : <div className='text-center' style={{paddingTop: 100}}>
        <span className='fa fa-circle-o-notch fa-3x fa-spin text-muted'/>
      </div>;

    // <li role="presentation" className={disabledTabClasses}>
    //   <a className='disabled'>Badges</a>
    // </li>
    // <li role="presentation" className={disabledTabClasses}>
    //   <a className='disabled'>Data</a>
    // </li>
    // <li role="presentation" className={disabledTabClasses}>
    //   <a className='disabled'>Related projects</a>
    // </li>

    return <div>
      <Breadcrumbs>
        <Link to='homePage'>
          Home
        </Link>
        <Link to='searchPage'>
          Civic Projects
        </Link>
        {repoName}
      </Breadcrumbs>
      {project ? <ProjectHeading {...project} repo={repo} /> : null}


      <div className='container'>
        <ul className="nav nav-tabs">
          <li role="presentation" className={readmeTabClasses}>
            <Link to='projectPage' params={{repoName}} query={{tab:'readme'}}>
              README
            </Link>
          </li>
          <li role="presentation" className={issueTabClasses}>
            <Link to='projectPage' params={{repoName}} query={{tab:'issues'}}>
              Issues
            </Link>
          </li>
          <li role="presentation" className={discussTabClasses}>
            <Link to='projectPage' params={{repoName}} query={{tab:'discussion'}}>
              Discussion
            </Link>
          </li>

        </ul>
        {!tab || tab == 'readme' ? readmeSection : null}
        {tab == 'issues' ? <IssueListComponent issues={issues} repo={repo} /> : null}
        {tab == 'discussion' ? <DiscussionListComponent repo={repo} /> : null}
      </div>

    </div>
  }
});
