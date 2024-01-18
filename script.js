$(document).ready(function () {
  const repoList = $("#repo-list");
  const defaultUsername = "leander006"; // Replace with your default GitHub username

  // Function to fetch and display repositories
  function fetchRepositories(username) {
    const apiUrl = `https://api.github.com/users/${username}/repos?sort=stars&per_page=5`;

    $.get(apiUrl, function (data) {
      repoList.empty(); // Clear previous results

      data.forEach(function (repo) {
        const repoItem = $('<li class="repo-item"></li>');
        repoItem.append(
          `<h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>`
        );
        repoItem.append(`<p>${repo.description}</p>`);
        repoList.append(repoItem);
      });
    });
  }

  // Initial fetch with default username
  fetchRepositories(defaultUsername);

  // Event listener for the search form
  $("#search-form").submit(function (event) {
    event.preventDefault();
    const username = $("#search-input").val();
    fetchRepositories(username);
  });

  // Event listener for the search input click
  $("#search-input").click(function () {
    // Clear the input field when clicked for a better user experience
    $(this).val("");
  });
});
