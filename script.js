$(document).ready(function () {
  const repoList = $("#repo-list");
  const userInfoContainer = $("#user-info");
  const githubContainer = $(".github-link");
  const loadingOverlay = $("#loading-overlay"); // Add loading overlay element
  let defaultUsername = "leander006";
  let currentPage = 1;
  const reposPerPage = 6;
  let totalRepoPages = 1;

  function showLoadingOverlay() {
    loadingOverlay.show();
  }

  function hideLoadingOverlay() {
    loadingOverlay.hide();
  }

  // Utility function to parse the "Link" header and extract the last page number
  function extractLastPage(linkHeader) {
    const links = linkHeader.split(", ");
    for (const link of links) {
      const match = link.match(/<([^>]+)>;\s*rel="last"/);
      if (match) {
        const lastPageLink = match[1];
        const lastPageMatch = lastPageLink.match(/&page=(\d+)/);
        return lastPageMatch ? parseInt(lastPageMatch[1]) : totalRepoPages;
      }
    }
    return totalRepoPages;
  }

  function fetchUserInfo(username) {
    const apiUrl = `https://api.github.com/users/${username}`;

    showLoadingOverlay(); // Show loading overlay before making the request

    $.get(apiUrl)
      .done(function (userData) {
        hideLoadingOverlay(); // Hide loading overlay on successful response

        userInfoContainer.empty();
        githubContainer.empty();

        const imageContainer = $('<div class="user-image-container"></div>');
        imageContainer.append(
          `<img src="${userData.avatar_url}" alt="Profile Picture">`
        );
        userInfoContainer.append(imageContainer);

        const detailsContainer = $(
          '<div class="user-details-container"></div>'
        );
        detailsContainer.append(`<h1>${userData.name}</h1>`);
        if (userData.bio) {
          detailsContainer.append(`<p>${userData.bio}</p>`);
        } else {
          detailsContainer.append(`<p>No description</p>`);
        }

        if (userData.location) {
          detailsContainer.append(`<p>${userData.location}</p>`);
        }
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
      })
      .fail(function (error) {
        hideLoadingOverlay(); // Hide loading overlay on error
        alert("Failed to fetch repositories. Please try again.");

        console.error("Error fetching repositories:", error);
      });
  }

  function fetchRepositories(username, page) {
    const apiUrl = `https://api.github.com/users/${username}/repos?sort=stars&per_page=${reposPerPage}&page=${page}`;

    showLoadingOverlay(); // Show loading overlay before making the request

    $.get(apiUrl).done(function (data, status, xhr) {
      hideLoadingOverlay(); // Hide loading overlay on successful response
      repoList.empty();
      data.forEach(function (repo) {
        const repoItem = $('<li class="repo-item"></li>');
        repoItem.append(
          `<h3><a class="link" id="r" href="${repo.html_url}" target="_blank">${repo.name}</a></h3>`
        );
        if (repo.description) {
          repoItem.append(`<p>${repo.description}</p>`);
        } else {
          repoItem.append(`<p>No description</p>`);
        }

        // Check if languages information is available
        if (repo.languages_url) {
          $.get(repo.languages_url, function (languages) {
            const languageList = Object.keys(languages);
            if (languageList.length > 0) {
              // Create a div for skills and append it to the repoItem
              const skillsContainer = $('<div class="skills-container"></div>');

              // Append each skill in a box
              languageList.forEach(function (language, index) {
                const skillBox = $(`<div class="skill-box">${language}</div>`);
                skillsContainer.append(skillBox);

                // If more than 3 skills, add a class for styling
                if (index >= 2) {
                  skillBox.addClass("hidden-skill");
                }
              });

              // Add a show more/less button if there are more than 3 skills
              if (languageList.length > 2) {
                const showMoreButton = $(
                  '<div class="show-more-button">Show More</div>'
                );
                skillsContainer.append(showMoreButton);

                showMoreButton.click(function () {
                  skillsContainer.toggleClass("expanded");
                  showMoreButton.text(
                    skillsContainer.hasClass("expanded")
                      ? "Show Less"
                      : "Show More"
                  );
                });
              }

              repoItem.append(skillsContainer);
            }
          });
        }

        repoList.append(repoItem);
      });

      const linkHeader = xhr.getResponseHeader("Link");
      totalRepoPages = extractLastPage(linkHeader);
      updatePaginationButtons(xhr);
      updatePagination(page, totalRepoPages);
    });
  }

  function updatePaginationButtons(xhr) {
    const linkHeader = xhr.getResponseHeader("Link");
    const hasNextPage = linkHeader && linkHeader.includes('rel="next"');
    const hasPrevPage = linkHeader && linkHeader.includes('rel="prev"');
    $("#next-page").prop("disabled", !hasNextPage);
    $("#prev-page").prop("disabled", !hasPrevPage);
  }

  function updatePagination(currentPage, totalPages) {
    $("#page-numbers").empty();
    for (let i = 1; i <= totalPages; i++) {
      const pageNumberButton = $(
        `<button class="page-number-button">${i}</button>`
      );
      pageNumberButton.click(function () {
        fetchRepositories(defaultUsername, i);
      });
      if (i === currentPage) {
        pageNumberButton.addClass("current-page");
      }
      $("#page-numbers").append(pageNumberButton);
    }

    $("#current-page").text(currentPage);
  }

  // Initial fetch with default username and page 1
  fetchUserInfo(defaultUsername);
  fetchRepositories(defaultUsername, currentPage);

  $("#search-btn").click(function (event) {
    event.preventDefault();

    const username = $("#username-input").val();
    $("#username-input").val("");
    defaultUsername = username.trim(); // Trim leading and trailing spaces
    if (defaultUsername !== "") {
      currentPage = 1;
      fetchUserInfo(defaultUsername);
      fetchRepositories(defaultUsername, currentPage);
    }
  });

  // Event listener for the search input click
  $("#search-input").click(function () {
    $(this).val("");
  });

  // Event listener for the refreshing
  $(".github").click(function () {
    defaultUsername = "leander006";
    console.log("defaultUsername", defaultUsername);
    fetchUserInfo(defaultUsername);
    fetchRepositories(defaultUsername, currentPage);
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
