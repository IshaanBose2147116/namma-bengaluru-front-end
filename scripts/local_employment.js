import ServerAPI from "./server_api.js";

function id(id) {
    return document.getElementById(id);
}

$(document).ready(() => {
    if (sessionStorage.getItem("isbusiness")) {
        $("#add-job-posting").css("display", "flex");
        $("#add-job-posting").off("click", "#add-posting", addJobPosting);
        $("#add-job-posting").on("click", "#add-posting", addJobPosting);
    } else {
        $("#add-job-posting").css("display", "none");
        $("#add-job-posting").off("click", "#add-posting", addJobPosting);
    }

    id("job-title").onkeyup = validateJobTitle;
    id("job-title").onblur = validateJobTitle;
    id("description").onkeyup = validateDescription;
    id("description").onblur = validateDescription;
    id("starts-by").onchange = validateStartsBy;
    id("starts-by").onblur = validateStartsBy;
    id("expires-by").onchange = validateExpiresBy;
    id("expires-by").onblur = validateExpiresBy;
    id("experience").onkeyup = validateExperience;
    id("experience").onblur = validateExperience;
    id("salary").onkeyup = validateSalary;
    id("salary").onblur = validateSalary;

    getJobPostings();
});

function validateJobTitle() {
    const jobTitle = id("job-title").value;

    if (jobTitle.length === 0) {
        id("title-err").innerText = "* mandatory";
        return false;
    }

    id("title-err").innerText = "";

    return true;
}

function validateDescription() {
    const description = id("description").value;

    if (description.length > 500) {
        id("description-err").innerText = `Cannot be longer than 500 characters. (${ description.length }/500)`;
        return false;
    }

    id("description-err").innerText = "";

    return true;
}

function validateStartsBy() {
    let startsBy = id("starts-by").value;

    if (startsBy.length === 0) {
        id("starts-by-err").innerText = "* mandatory";
        return false;
    }

    startsBy = new Date(startsBy.split("T")[0] + " " + startsBy.split("T")[1]);

    if (startsBy.getTime() < new Date().getTime()) {
        id("starts-by-err").innerText = "Cannot start before today!";
        return false;
    }

    id("starts-by-err").innerText = "";
    return true;
}

function validateExpiresBy() {
    let expiresBy = id("expires-by").value;

    if (expiresBy.length === 0) {
        id("expires-by-err").innerText = "* mandatory";
        return false;
    }

    if (id("starts-by").value.length === 0) {
        validateStartsBy();
        id("expires-by-err").innerText = "Must enter starts by date first!";
        return false;
    }

    let startsBy = id("starts-by").value;
    startsBy = new Date(startsBy.split("T")[0] + " " + startsBy.split("T")[1]);
    expiresBy = new Date(expiresBy.split("T")[0] + " " + expiresBy.split("T")[1]);

    if (expiresBy.getTime() < startsBy.getTime()) {
        id("expires-by-err").innerText = "Cannot expire before starting!";
        return false;
    }

    id("expires-by-err").innerText = "";
    return true;
}

function validateExperience() {
    const experience = id("experience").value;

    if (experience.length !== 0) {
        if (experience.length > 4) {
            id("experience-err").innerText = "Cannot be more than 4 characters!";
            return false;
        }
    
        if (isNaN(parseFloat(experience))) {
            id("experience-err").innerText = "Must be a number!";
            return false;
        }
    
        if (parseFloat(experience) <= 0) {
            id("experience-err").innerText = "Cannot be <= 0!";
            return false;
        }
    }

    id("experience-err").innerText = "";
    return true;
}

function validateSalary() {
    const salary = id("salary").value;

    if (salary.length === 0) {
        id("salary-err").innerText = "* mandatory";
        return false;
    }

    if (isNaN(parseFloat(salary))) {
        id("salary-err").innerText = "Must be a number!";
        return false;
    }

    if (parseFloat(salary) <= 0) {
        id("salary-err").innerText = "Cannot be <= 0!";
        return false;
    }

    id("salary-err").innerText = "";
    return true;
}

function addJobPosting() {
    let jobTitle = id("job-title").value;
    let description = id("description").value;
    let startsBy = id("starts-by").value;
    let expiresBy = id("expires-by").value;
    let salary = id("salary").value;
    let contactInfo = id("contact-info").value;
    let requiredSkills = id("required-skills").value;
    let experience = id("experience").value;

    startsBy = `${ startsBy.split("T")[0] } ${ startsBy.split("T")[1] }:00`;
    expiresBy = `${ expiresBy.split("T")[0] } ${ expiresBy.split("T")[1] }:00`;

    contactInfo = contactInfo.split(",");
    requiredSkills = requiredSkills.split(",");

    for (let i = 0; i < contactInfo.length; i++) {
        contactInfo[i] = contactInfo[i].trim();
    }

    for (let i = 0; i < requiredSkills.length; i++) {
        requiredSkills[i] = requiredSkills[i].trim();
    }

    if (contactInfo.length === 1)
        if (contactInfo[0].length === 0)
            contactInfo = [];
        
    if (requiredSkills.length === 1)
        if (requiredSkills[0].length === 0)
            requiredSkills = [];
    
    description = description.replaceAll("<script>", "script");
    description = description.replaceAll("</script>", "script");
    
    console.log("Job title:", jobTitle);
    console.log("Description:", description);
    console.log("Starts by:", startsBy);
    console.log("Expires by:", expiresBy);
    console.log("Salary:", salary);
    console.log("Contact info:", contactInfo);
    console.log("Required skills:", requiredSkills);

    const validJobTitle = validateJobTitle();
    const validDescription = validateDescription();
    const validStartsBy = validateStartsBy();
    const validExpiresBy = validateExpiresBy();
    const validExperience = validateExperience();
    const validSalary = validateSalary();

    if (validJobTitle && validDescription && validStartsBy && validExpiresBy && validSalary && validExperience) {
        fetch(`${ ServerAPI.server }/add-job-posting`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                posted_by: sessionStorage.getItem("uid"),
                job_title: jobTitle,
                experience: experience,
                description: description.length === 0 ? null : description,
                starts_by: startsBy,
                expires_by: expiresBy,
                salary: salary,
                contact_info: contactInfo,
                required_skills: requiredSkills
            })
        }).then(response => {
            if (response.status === 200) {
                getJobPostings();
            } else {
                alert("Could not upload job postings.");
                response.json().then(data => console.log(data));
            }
        });
    }
}

function getJobPostings() {
    let url = "";

    if (sessionStorage.getItem("isbusiness")) {
        url = `${ ServerAPI.server }/job-postings/${ sessionStorage.getItem("uid") }`;
    } else {
        url = `${ ServerAPI.server }/job-postings`;
    }

    fetch(url, { 
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(response => {
        response.json().then(data => {
            if (response.status === 200) {
                displayJobPostings(data);
            } else  {
                alert("Could not retrieve information! Please try again later.");
                console.log(data);
            }
        });
    });
}

function displayJobPostings(data) {
    console.log(data);
    id("job-posting-container").innerHTML = "";
    
    for (let i = 0; i < data.length; i++) {
        if (!sessionStorage.getItem("isbusiness")) {
            if (new Date(data[i].expires_by).getTime() < new Date().getTime())
                continue;
        }

        let contactInfoList = data[i].contact_info.length === 0 ? "N/A" : "";
        let requiredSkillsList = data[i].required_skills.length === 0 ? "N/A" : "";

        for (let j = 0; j < data[i].contact_info.length; j++) {
            contactInfoList += `<li>${ data[i].contact_info[j] }</li>`;
        }

        for (let j = 0; j < data[i].required_skills.length; j++) {
            requiredSkillsList += `<li>${ data[i].required_skills[j] }</li>`;
        }

        id("job-posting-container").innerHTML += `
        <div class="job-container" id="job-container-${i}" 
            ${ new Date(data[i].expires_by).getTime() < new Date().getTime() ? 
                'style="background-color: red;"' : "" }>
            <div class="cust-row">
                <h3>Job Title:</h3>
                <h3 id="job-title">${ data[i].job_title }</h3>
                ${ new Date(data[i].expires_by).getTime() < new Date().getTime() ?
                    '<span>Expired</span>' : "" }
                ${ sessionStorage.getItem("isbusiness") ? 
                `<span class="material-icons cancel-button" id="delete-${i}">cancel</span>` :
                "" }
            </div>
            <div class="cust-row">
                <b>Posted by:</b> <span>${ data[i].business_name }</span>
            </div>
            <div class="cust-row">
                <b>Salary:</b> <span>₹ ${ data[i].salary }</span>
            </div>
            <div class="cust-row">
                <b>Starts By:</b> <span>${ data[i].starts_by.split(" ")[0] }</span>
            </div>
            <span class="more-info" id="more-info-${i}">More Info</span>
            <div id="job-info-${i}" style="display: none;">
                <div class="cust-row">
                    <div id="job-description">${ data[i].description }</div>
                </div>
                <div class="cust-row">
                    <b>Experience:</b> <span>${ data[i].experience } years</span>
                </div>
                <div class="cust-row">
                    <b>Contact:</b>
                    ${ contactInfoList === "N/A" ? contactInfoList : `<ul>${ contactInfoList }</ul>` }
                </div>
                <div class="cust-row">
                    <b>Required Skils:</b>
                    ${ requiredSkillsList === "N/A" ? requiredSkillsList : `<ul>${ requiredSkillsList }</ul>` }
                </div>
            </div>
            <span class="more-info" id="less-info-${i}" style="display: none;">Less Info</span>
        </div>
        `;
    }

    for (let i = 0; i < data.length; i++) {
        $(`#job-container-${i}`).off("click", `#more-info-${i}`, showMoreInfo);
        $(`#job-container-${i}`).on("click", `#more-info-${i}`, showMoreInfo);
        $(`#job-container-${i}`).off("click", `#less-info-${i}`, showLessInfo);
        $(`#job-container-${i}`).on("click", `#less-info-${i}`, showLessInfo);
        $(`#job-container-${i}`).off("click", `#delete-${i}`, () => deletePosting(data[i].posted_on));
        $(`#job-container-${i}`).on("click", `#delete-${i}`, () => deletePosting(data[i].posted_on));
    }
}

function showMoreInfo(evt) {
    const id = evt.currentTarget.id.split("-")[2];
    
    $(`#job-info-${id}`).css("display", "block");
    $(`#less-info-${id}`).css("display", "block");
    $(`#more-info-${id}`).css("display", "none");
}

function showLessInfo(evt) {
    const id = evt.currentTarget.id.split("-")[2];

    $(`#job-info-${id}`).css("display", "none");
    $(`#less-info-${id}`).css("display", "none");
    $(`#more-info-${id}`).css("display", "block");
}

function deletePosting(postedOn) {
    console.log(postedOn, sessionStorage.getItem("uid"));

    fetch(`${ ServerAPI.server }/delete-job-posting/${ postedOn }/${ sessionStorage.getItem("uid") }`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    }).then(response => {
        if (response.status === 200) {
            getJobPostings();
        } else {
            alert("Could not delete job posting, please try again later.");
            response.json().then(data => console.log(data));
        }
    });
}
