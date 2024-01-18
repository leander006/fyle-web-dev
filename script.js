$(document).ready(function () {
  const repoList = $("#repo-list");
  const userInfoContainer = $("#user-info");
  const githubContainer = $(".github-link");
  const defaultUsername = "leander006"; // Replace with your default GitHub username
  let currentPage = 1;
  const reposPerPage = 6;

  // Function to fetch and display user information
  function fetchUserInfo(username) {
    const apiUrl = `https://api.github.com/users/${username}`;

    $.get(apiUrl, function (userData) {
      console.log(userData);
      // Display user information
      userInfoContainer.empty();
      // Create a div for the image and append it to the userContainer
      const imageContainer = $('<div class="user-image-container"></div>');
      imageContainer.append(
        `<img src="${userData.avatar_url}" alt="Profile Picture">`
      );
      userInfoContainer.append(imageContainer);

      // Create a div for the user details and append it to the userContainer
      const detailsContainer = $('<div class="user-details-container"></div>');
      detailsContainer.append(`<h1>${userData.name}</h1>`);
      detailsContainer.append(`<p>${userData.bio}</p>`);
      if (userData.blog) {
        detailsContainer.append(
          `<p><a href="${userData.blog}" target="_blank">Website</a></p>`
        );
      }
      userInfoContainer.append(detailsContainer);
      githubContainer.append(
        `<p><a class="link" href="${userData.html_url}" target="_blank">${userData.html_url}</a></p>`
      );
      // Display current page number
      $("#current-page").text(currentPage);
    });
  }

  // Function to fetch and display repositories
  function fetchRepositories(username, page) {
    const apiUrl = `https://api.github.com/users/${username}/repos?sort=stars&per_page=${reposPerPage}&page=${page}`;

    $.get(apiUrl, function (data, status, xhr) {
      repoList.empty(); // Clear previous results
      console.log(data);
      data.forEach(function (repo) {
        const repoItem = $('<li class="repo-item"></li>');
        repoItem.append(
          `<h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>`
        );
        repoItem.append(`<p>${repo.description}</p>`);
        repoList.append(repoItem);
      });

      // Enable or disable Next and Previous buttons based on the Link header from GitHub API
      const linkHeader = xhr.getResponseHeader("Link");
      const hasNextPage = linkHeader && linkHeader.includes('rel="next"');
      const hasPrevPage = linkHeader && linkHeader.includes('rel="prev"');
      $("#next-page").prop("disabled", !hasNextPage);
      $("#prev-page").prop("disabled", !hasPrevPage);
    });
  }

  // Initial fetch with default username and page 1
  fetchUserInfo(defaultUsername);
  fetchRepositories(defaultUsername, currentPage);

  // Event listener for the search form
  $("#search-form").submit(function (event) {
    event.preventDefault();
    const username = $("#search-input").val();
    currentPage = 1;
    fetchUserInfo(username);
    fetchRepositories(username, currentPage);
  });

  // Event listener for the search input click
  $("#search-input").click(function () {
    $(this).val("");
  });

  // Event listener for the "Next" button
  $("#next-page").click(function () {
    currentPage++;
    const username = $("#search-input").val() || defaultUsername;
    fetchRepositories(username, currentPage);
  });

  // Event listener for the "Previous" button
  $("#prev-page").click(function () {
    currentPage = Math.max(currentPage - 1, 1);
    const username = $("#search-input").val() || defaultUsername;
    fetchRepositories(username, currentPage);
  });
});
